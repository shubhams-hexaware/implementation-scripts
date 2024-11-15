const pgClient = require("../utils/pgClient.js");
const logger = require("../utils/logger.js");

async function getTenantByNameHelper(tenantName) {
  logger.info(`getTenantByNameHelper -> tenant name is ${tenantName}`);

  const pool = pgClient.getPool("TENSAI_AUTH_DB");

  const { rows: tenants } = await pool.query(`
    SELECT id, name
    FROM tenant
    WHERE name like '%${tenantName}%'
  `);

  return tenants?.[0] ?? null;
}

async function getAllTenantsHelper(tenantName) {
  logger.info(`getAllTenantsHelper -> fetching tenants - ${tenantName}`);

  const pool = pgClient.getPool("TENSAI_AUTH_DB");
  if (tenantName === "All") {
    const { rows: tenants } = await pool.query(`
    SELECT id, name
    FROM tenant
    WHERE name in 
    ('Hexaware','Reworld','Vontier','Subsea7','Murphy USA','Wickes','Inland','Karering','SSRM','Eurostar','Carlyle')
  `);
    return tenants ?? null;
  } else {
    const { rows: tenants } = await pool.query(`
    SELECT id, name
    FROM tenant
    WHERE name in 
    ('${tenantName}')
  `);
    return tenants ?? null;
  }
}

async function getUATTenantsHelper(tenantName) {
  logger.info(`getAllTenantsHelper -> fetching tenants - ${tenantName}`);

  const pool = pgClient.getPool("TENSAI_AUTH_DB");

  const { rows: tenants } = await pool.query(`
    SELECT id, name
    FROM tenant
    WHERE name in ('Karering')
  `);

  return tenants ?? null;
}

async function getProdUkTenantsHelper(tenantName) {
  logger.info(`getAllTenantsHelper -> fetching tenants - ${tenantName}`);

  const pool = pgClient.getPool("TENSAI_AUTH_DB");

  const { rows: tenants } = await pool.query(`
    SELECT id, name
    FROM tenant
    WHERE name in ('LV')
  `);

  return tenants ?? null;
}

async function getAssignmentGroupsByTenantId(tenantId) {
  logger.info(`getAssignmentGroupsByTenantId -> tenant id is ${tenantId}`);

  const pool = pgClient.getPool("TENSAI_DB");

  const { rows: assignmentGroup } = await pool.query(`
    SELECT id, "tenantId", "assignmentGroupListSelectedJson", "assignmentGroupListJson" 
    FROM managedqueue 
    WHERE "tenantId" = ${tenantId}
  `);

  return assignmentGroup?.[0] ?? null;
}

module.exports = {
  getTenantByNameHelper,
  getAllTenantsHelper,
  getAssignmentGroupsByTenantId,
  getUATTenantsHelper,
  getProdUkTenantsHelper,
};
