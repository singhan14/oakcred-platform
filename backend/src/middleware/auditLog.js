const prisma = require('../config/database');

/**
 * Audit logging middleware — records auth events and data access events.
 */
const auditLog = (action, entity) => {
  return async (req, res, next) => {
    // Log after response is sent
    const originalSend = res.send;
    res.send = function (body) {
      // Only log successful operations
      if (res.statusCode < 400) {
        prisma.auditLog.create({
          data: {
            userId: req.user?.userId || null,
            firmId: req.user?.firmId || null,
            action,
            entity,
            entityId: req.params.id || req.params.borrowerId || null,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: {
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode,
            },
          },
        }).catch(err => console.error('Audit log error:', err));
      }
      originalSend.call(this, body);
    };
    next();
  };
};

module.exports = auditLog;
