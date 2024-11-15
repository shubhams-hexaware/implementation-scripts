const pgClient = require("../utils/pgClient.js");
const logger = require("../utils/logger.js");

// Helper function to check if a systemViewWidgetMaster record exists
async function checkSystemViewWidgetMasterExists(code) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rows } = await pool.query('SELECT id FROM "systemViewWidgetMaster" WHERE code = $1', [code]);
  return rows.length > 0 ? rows[0].id : null;
}

// Helper function to check if a systemViewWidgetMaster record exists
async function getsystemViewDashboardId(name) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rows } = await pool.query('SELECT id FROM "systemViewDashboard" WHERE name = $1;', [name]);
  return rows.length > 0 ? rows[0].id : null;
}

// Helper function to check if a systemViewTabs record exists
async function getSystemViewTabsId(dashboardId, name) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rows } = await pool.query('select * from "systemViewTabs" where "systemViewdashboardid" = $1 and "tabName" = $2', [dashboardId, name]);
  return rows[0] ?? null;
}

// Helper function to check if a systemViewTabs record exists
async function getSystemViewTabMappingsId(tabId, tenantId) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rows } = await pool.query('select id from "systemViewTabMappings" where "tabId" = $1 and "tenantId" = $2', [tabId, tenantId]);
  return rows.length > 0 ? rows[0].id : null;
}

// Helper function to check if a systemViewWidget record exists
async function checkSystemViewWidgetExists(systemViewWidgetMasterId, tenantId) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rows } = await pool.query('SELECT 1 FROM "systemViewWidget" WHERE "systemViewWidgetMasterId" = $1 AND "tenantId" = $2', [systemViewWidgetMasterId, tenantId]);
  return rows.length > 0;
}

// Helper function to check if a SystemViewTabWidgetMapping record exists
async function checkSystemViewTabWidgetMappingExists(svTabMappingId, svWidgetMasterId) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rows } = await pool.query('SELECT 1 FROM "systemViewTabWidgetMapping" WHERE "SVTabMappingId" = $1 AND "SVWidgetMasterId" = $2', [svTabMappingId, svWidgetMasterId]);
  return rows.length > 0;
}

// Helper function to insert a new systemViewWidgetMaster record
async function insertSystemViewWidgetMaster(dashboardId, name, description, code, widgetConfigurationTemplate, subTitle) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rows } = await pool.query(
    `INSERT INTO "systemViewWidgetMaster"("systemViewDashboardId", name, description, code, "widgetConfigurationTemplate", "subTitle")
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [dashboardId, name, description, code, widgetConfigurationTemplate, subTitle]
  );
  return rows[0].id;
}

async function insertSystemViewWidget(systemViewWidgetMasterId, tenantId, productId, widgetConfigJSON, widgetProductLink) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rows } = await pool.query(
    `INSERT INTO "systemViewWidget"("systemViewWidgetMasterId", "tenantId", "productId", "widgetConfigurationJSON", "widgetProductLink")
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [systemViewWidgetMasterId, tenantId, productId, widgetConfigJSON, widgetProductLink]
  );
  return rows[0].id;
}

async function updateSystemViewWidgetMaster(dashboardId, name, description, code, widgetConfigurationTemplate, subTitle) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rowCount } = await pool.query(
    `UPDATE "systemViewWidgetMaster"
     SET name = $1, description = $2, "widgetConfigurationTemplate" = $4, "subTitle" = $5
     WHERE "code" = $3`,
    [name, description, code, widgetConfigurationTemplate, subTitle]
  );

  if (rowCount === 0) {
    return await insertSystemViewWidgetMaster(dashboardId, name, description, code, widgetConfigurationTemplate, subTitle);
  }

  const { rows } = await pool.query(`SELECT id FROM "systemViewWidgetMaster" WHERE "code" = $1`, [code]);

  return rows[0].id;
}

async function updateSystemViewWidget(systemViewWidgetMasterId, tenantId, productId, widgetConfigJSON, widgetProductLink) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rowCount } = await pool.query(
    `UPDATE "systemViewWidget"
     SET "widgetConfigurationJSON" = $4, "widgetProductLink" = $5
     WHERE "systemViewWidgetMasterId" = $1 AND "tenantId" = $2 AND "productId" = $3`,
    [systemViewWidgetMasterId, tenantId, productId, widgetConfigJSON, widgetProductLink]
  );

  if (rowCount === 0) {
    return await insertSystemViewWidget(systemViewWidgetMasterId, tenantId, productId, widgetConfigJSON, widgetProductLink);
  }

  const { rows } = await pool.query(
    `SELECT id FROM "systemViewWidget"
     WHERE "systemViewWidgetMasterId" = $1 AND "tenantId" = $2 AND "productId" = $3`,
    [systemViewWidgetMasterId, tenantId, productId]
  );

  return rows[0].id;
}

// Helper function to insert a new systemViewTabWidgetMapping record
async function insertSystemViewTabWidgetMapping(svTabMappingId, svWidgetMasterId) {
  const pool = pgClient.getPool("TENSAI_DB");
  const { rows } = await pool.query(
    `INSERT INTO "systemViewTabWidgetMapping"("SVTabMappingId", "SVWidgetMasterId")
     VALUES ($1, $2) RETURNING id`,
    [svTabMappingId, svWidgetMasterId]
  );
  return rows[0].id;
}

module.exports = {
  checkSystemViewWidgetMasterExists,
  insertSystemViewWidgetMaster,
  checkSystemViewWidgetExists,
  insertSystemViewWidget,
  getsystemViewDashboardId,
  getSystemViewTabsId,
  getSystemViewTabMappingsId,
  insertSystemViewTabWidgetMapping,
  updateSystemViewWidgetMaster,
  updateSystemViewWidget,
  checkSystemViewTabWidgetMappingExists,
};
