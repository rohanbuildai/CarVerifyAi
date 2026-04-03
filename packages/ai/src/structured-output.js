/**
 * @fileoverview Zod schemas for validating structured LLM output.
 * @module @carverify/ai
 */

const { z } = require('zod');

const reportSectionSchema = z.object({
  sectionType: z.enum(['summary', 'ownership', 'insurance', 'service', 'maintenance', 'parts', 'verdict']),
  titleEn: z.string().min(1),
  titleHi: z.string().min(1),
  contentEn: z.string().min(10),
  contentHi: z.string().min(10),
  confidence: z.number().min(0).max(1),
});

const reportOutputSchema = z.object({
  sections: z.array(reportSectionSchema).min(1).max(10),
  overallConfidence: z.number().min(0).max(1),
  disclaimers: z.array(z.string()).default([]),
  dataGaps: z.array(z.string()).default([]),
});

/**
 * Validate and parse LLM structured output.
 * @param {string} rawOutput - Raw JSON string from LLM
 * @returns {{ success: boolean, data?: z.infer<typeof reportOutputSchema>, error?: import('zod').ZodError }}
 */
function validateStructuredOutput(rawOutput) {
  let parsed;
  try {
    // Handle potential markdown code fences
    let cleaned = rawOutput.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    parsed = JSON.parse(cleaned);
  } catch (err) {
    return {
      success: false,
      error: new z.ZodError([{ code: 'custom', message: `Invalid JSON: ${err.message}`, path: [] }]),
    };
  }

  const result = reportOutputSchema.safeParse(parsed);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

module.exports = { reportOutputSchema, reportSectionSchema, validateStructuredOutput };
