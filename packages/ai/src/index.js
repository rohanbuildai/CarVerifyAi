/**
 * @fileoverview AI module barrel export.
 * @module @carverify/ai
 */

const { buildReportPrompt } = require('./prompt-builder');
const { reportOutputSchema, validateStructuredOutput } = require('./structured-output');
const { generateReport } = require('./report-generator');
const { generateChatResponse } = require('./chat');

module.exports = { buildReportPrompt, reportOutputSchema, validateStructuredOutput, generateReport, generateChatResponse };
