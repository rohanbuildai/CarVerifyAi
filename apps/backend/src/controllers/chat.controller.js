/**
 * @fileoverview Chat controller — create conversations, send messages.
 */

const { prisma } = require('@carverify/db');
const { NotFoundError, ForbiddenError, PaymentRequiredError } = require('@carverify/shared');
const { createLogger } = require('@carverify/observability');

const log = createLogger('chat-controller');

const chatController = {
  /**
   * POST /chat/conversations
   */
  async createConversation(req, res) {
    const { reportId } = req.body;
    const userId = req.user.id;

    const report = await prisma.riskReport.findUnique({
      where: { id: reportId },
      include: { query: { select: { userId: true } } },
    });

    if (!report) throw new NotFoundError('Report');
    if (report.query.userId !== userId) throw new ForbiddenError();
    if (!report.isPaid) throw new PaymentRequiredError('Unlock the report to use AI chat');

    // Find existing or create new conversation
    let conversation = await prisma.aiConversation.findFirst({
      where: { reportId, userId, status: 'active' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) {
      conversation = await prisma.aiConversation.create({
        data: { reportId, userId, title: 'Vehicle Q&A', status: 'active' },
        include: { messages: true },
      });
    }

    res.json({ conversation });
  },

  /**
   * GET /chat/conversations/:convId
   */
  async getConversation(req, res) {
    const { convId } = req.params;

    const conversation = await prisma.aiConversation.findUnique({
      where: { id: convId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) throw new NotFoundError('Conversation');
    if (conversation.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError();
    }

    res.json({ conversation });
  },

  /**
   * POST /chat/conversations/:convId/messages
   */
  async sendMessage(req, res) {
    const { convId } = req.params;
    const { content, language } = req.validated;
    const userId = req.user.id;

    const conversation = await prisma.aiConversation.findUnique({
      where: { id: convId },
      include: {
        report: {
          include: {
            query: { include: { vehicle: true } },
            sections: true,
          },
        },
        messages: { orderBy: { createdAt: 'asc' }, take: 20 },
      },
    });

    if (!conversation) throw new NotFoundError('Conversation');
    if (conversation.userId !== userId) throw new ForbiddenError();

    // Save user message
    const userMessage = await prisma.aiMessage.create({
      data: { conversationId: convId, role: 'user', content },
    });

    // Build AI context from report data
    const report = conversation.report;
    const vehicle = report?.query?.vehicle;
    const reportContext = report?.sections?.map((s) => `${s.titleEn}: ${s.contentEn}`).join('\n\n') || '';

    const systemPrompt = `You are CarVerify AI, an expert automotive analyst for the Indian used-car market.
You have access to the following vehicle report data. Only use this data to answer questions.
Do NOT fabricate information. If you don't know, say so.

Vehicle: ${vehicle?.make || 'Unknown'} ${vehicle?.model || ''} (${vehicle?.year || 'Unknown'})
Registration: ${vehicle?.registrationNo || 'N/A'}
Risk Score: ${report?.overallRiskScore || 'N/A'}/100 (${report?.riskVerdict || 'N/A'})

Report Data:
${reportContext}

Respond in ${language === 'hi' ? 'Hindi' : 'English'}. Be concise but helpful.`;

    // Build message history for context
    const messageHistory = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Generate AI response (simplified — real implementation in packages/ai)
    let aiContent;
    const startTime = Date.now();
    try {
      // Import AI chat module
      const { generateChatResponse } = require('@carverify/ai/src/chat');
      aiContent = await generateChatResponse({
        systemPrompt,
        messages: [...messageHistory, { role: 'user', content }],
        language,
      });
    } catch (err) {
      log.error({ err }, 'AI chat generation failed');
      aiContent = language === 'hi'
        ? 'क्षमा करें, मैं अभी जवाब देने में असमर्थ हूँ। कृपया बाद में पुनः प्रयास करें।'
        : 'I apologize, I am unable to respond right now. Please try again later.';
    }
    const latencyMs = Date.now() - startTime;

    // Save assistant message
    const assistantMessage = await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: aiContent,
        latencyMs,
        modelUsed: 'gpt-4o-mini',
      },
    });

    res.json({ userMessage, assistantMessage });
  },
};

module.exports = { chatController };
