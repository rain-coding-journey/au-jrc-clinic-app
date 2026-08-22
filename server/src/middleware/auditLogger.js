const db = require('../../config/db');

const logAudit = (action, resourceType) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;
      
      // Fire-and-forget audit logging on successful API responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user.id : null;
        const resourceId = req.params.id || req.body.student_id || null;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        db.query(
          `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, action, resourceType, resourceId, ipAddress, userAgent]
        ).catch(err => console.error('Audit Log Error:', err));
      }

      return res.send(body);
    };

    next();
  };
};

module.exports = { logAudit };