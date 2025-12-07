const prisma = require('../prisma');

const logAction = async (actorId, action, entity, entityId, payload = {}) => {
  try {
    await prisma.auditLog.create({
      data: {
        actor_id: actorId,
        action,
        entity,
        entity_id: String(entityId),
        payload,
      },
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

module.exports = logAction;
