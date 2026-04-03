const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createRateLimiter } = require('@carverify/security/src/rate-limit');
const { chatMessageSchema } = require('@carverify/shared');
const { chatController } = require('../controllers/chat.controller');

function createChatRoutes({ redis }) {
  const router = Router();

  const chatLimiter = createRateLimiter(redis, {
    max: 20, windowMs: 60000, prefix: 'rl:chat',
    keyFn: (req) => req.user?.id,
  });

  router.post('/conversations', requireAuth, chatController.createConversation);
  router.get('/conversations/:convId', requireAuth, chatController.getConversation);
  router.post('/conversations/:convId/messages', requireAuth, chatLimiter, validate(chatMessageSchema), chatController.sendMessage);

  return router;
}

module.exports = { createChatRoutes };
