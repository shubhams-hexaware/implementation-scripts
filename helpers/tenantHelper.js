const pgClient = require("../utils/pgClient.js");
const logger = require("../utils/logger.js");

exports.getTenantByNameHelper = async function getTenantByNameHelper(tenantName) {
  logger.info(`getTenantByNameHelper -> tenant name is ${tenantName}`);

  const pool = pgClient.getPool("TENSAI_AUTH_DB");

  const { rows: tenants } = await pool.query(`
    SELECT id, name
    FROM tenant
    WHERE name like '%${tenantName}%'
  `);

  return tenants?.[0] ?? null;
};

exports.getAssignmentGroupsByTenantId = async function getAssignmentGroupsByTenantId(tenantId) {
  logger.info(`getAssignmentGroupsByTenantId -> tenant id is ${tenantId}`);

  const pool = pgClient.getPool("TENSAI_DB");

  const { rows: assignmentGroup } = await pool.query(`
    SELECT id, "tenantId", "assignmentGroupListSelectedJson", "assignmentGroupListJson" 
    FROM managedqueue 
    WHERE "tenantId" = ${tenantId}
  `);

  return assignmentGroup?.[0] ?? null;
};
