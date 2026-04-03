/**
 * @fileoverview Chat response generation for follow-up Q&A.
 * @module @carverify/ai
 */

const OpenAI = require('openai');
const { getEnv } = require('@carverify/config');
const { createLogger } = require('@carverify/observability');

const log = createLogger('ai-chat');

/**
 * Generate a chat response grounded in report context.
 * @param {Object} params
 * @param {string} params.systemPrompt - System prompt with report context
 * @param {Array<{role: string, content: string}>} params.messages - Conversation history
 * @param {string} [params.language='en'] - Response language
 * @returns {Promise<string>} AI response content
 */
async function generateChatResponse({ systemPrompt, messages, language = 'en' }) {
  const env = getEnv();

  if (!env.OPENAI_API_KEY) {
    return language === 'hi'
      ? 'AI सेवा अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।'
      : 'AI service is not currently available. Please try again later.';
  }

  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    timeout: 15000,
  });

  try {
    const response = await client.chat.completions.create({
      model: env.AI_CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10), // Last 10 messages for context window
      ],
      max_tokens: Number(env.AI_CHAT_MAX_TOKENS),
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty chat response from LLM');
    }

    return content;
  } catch (err) {
    log.error({ err }, 'Chat LLM call failed');
    throw err;
  }
}

module.exports = { generateChatResponse };
