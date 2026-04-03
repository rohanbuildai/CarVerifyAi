/**
 * @fileoverview Report generator — calls LLM with structured output, validates, retries.
 * @module @carverify/ai
 */

const OpenAI = require('openai');
const { getEnv } = require('@carverify/config');
const { createLogger } = require('@carverify/observability');
const { buildReportPrompt, SYSTEM_PROMPT } = require('./prompt-builder');
const { validateStructuredOutput } = require('./structured-output');

const log = createLogger('report-generator');

/**
 * Generate a vehicle risk report using LLM.
 * @param {Object} params - Vehicle data, ownership, insurance, service, parts, risk scores
 * @returns {Promise<{ sections: Array, overallConfidence: number, disclaimers: string[], dataGaps: string[], modelUsed: string }>}
 */
async function generateReport(params) {
  const env = getEnv();
  const userPrompt = buildReportPrompt(params);

  const models = [
    { provider: 'openai', model: env.OPENAI_MODEL, apiKey: env.OPENAI_API_KEY, timeout: env.OPENAI_TIMEOUT_MS },
  ];

  if (env.ANTHROPIC_API_KEY) {
    models.push({ provider: 'anthropic', model: env.ANTHROPIC_MODEL, apiKey: env.ANTHROPIC_API_KEY, timeout: 30000 });
  }

  for (const modelConfig of models) {
    if (!modelConfig.apiKey) continue;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        log.info({ model: modelConfig.model, attempt }, 'Calling LLM for report generation');

        const client = new OpenAI({
          apiKey: modelConfig.apiKey,
          ...(modelConfig.provider === 'anthropic'
            ? { baseURL: 'https://api.anthropic.com/v1', defaultHeaders: { 'anthropic-version': '2023-06-01' } }
            : {}),
          timeout: modelConfig.timeout,
        });

        const startTime = Date.now();
        const response = await client.chat.completions.create({
          model: modelConfig.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: attempt === 0 ? userPrompt : `${userPrompt}\n\nIMPORTANT: Your previous response did not match the required JSON schema. Please output ONLY valid JSON.` },
          ],
          max_tokens: env.OPENAI_MAX_TOKENS,
          temperature: env.OPENAI_TEMPERATURE,
          response_format: { type: 'json_object' },
        });

        const latencyMs = Date.now() - startTime;
        const rawOutput = response.choices[0]?.message?.content;

        if (!rawOutput) {
          log.warn({ model: modelConfig.model }, 'Empty LLM response');
          continue;
        }

        const validation = validateStructuredOutput(rawOutput);
        if (validation.success) {
          log.info({ model: modelConfig.model, latencyMs, attempt }, 'Report generated successfully');
          return {
            ...validation.data,
            modelUsed: modelConfig.model,
            latencyMs,
          };
        }

        log.warn({ model: modelConfig.model, errors: validation.error.issues, attempt }, 'LLM output validation failed');
      } catch (err) {
        log.error({ err, model: modelConfig.model, attempt }, 'LLM call failed');
      }
    }
  }

  // All models failed — return rule-engine fallback indicator
  log.error('All LLM attempts failed, falling back to rule engine');
  return null;
}

module.exports = { generateReport };
