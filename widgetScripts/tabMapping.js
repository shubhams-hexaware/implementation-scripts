const fs = require("fs");
const csv = require("csv-parser");
const { checkSystemViewWidgetMasterExists, getsystemViewDashboardId, getSystemViewTabsId, getSystemViewTabMappingsId, checkSystemViewTabWidgetMappingExists, insertSystemViewTabWidgetMapping } = require("../helpers/widgetHelper");
const { getAllTenantsHelper, getUATTenantsHelper, getProdUkTenantsHelper } = require("../helpers/tenantHelper");
const pgClient = require("../utils/pgClient");
const configuration = require("./config");
const logger = require("../utils/logger.js");

// Read data from CSV file and insert into database
async function processCSVData() {
  pgClient.initPool("TENSAI_DB", {
    ...configuration.database.staging,
    database: "tensaidb",
  });

  pgClient.initPool("TENSAI_AUTH_DB", {
    ...configuration.database.staging,
    database: "tensaiauthdb",
  });

  const tenants = await getAllTenantsHelper("Ministry Brands");
  logger.info(`Fetched ${tenants.length} tenants.`);

  const dataRows = [];

  logger.info("Reading data from CSV file...");
  fs.createReadStream("AIOpsTabMappingMB.csv")
    .pipe(csv())
    .on("data", (row) => {
      dataRows.push(row);
    })
    .on("end", async () => {
      logger.info(`CSV file successfully processed. ${dataRows.length} rows found.`);
      await main(tenants, dataRows);
    });
}

async function main(tenants, dataRows) {
  try {
    for (const tenant of tenants) {
      logger.info(`Processing data for tenant: ${tenant.name} (ID: ${tenant.id})\n`);

      for (const dataRow of dataRows) {
        logger.info(`Processing tab: ${dataRow.tabName} (Code: ${dataRow.code})`);

        // Parse systemViewDashboardId to ensure it's a number
        const systemViewDashboardId = await getsystemViewDashboardId(dataRow.dashboardName);

        if (!systemViewDashboardId) {
          logger.error(`No Dashboard Found named - ${dataRow.dashboardName}. Skipping tab: ${dataRow.tabName}`);
          continue;
        }

        const tab = await getSystemViewTabsId(systemViewDashboardId, dataRow.tabName);

        if (!tab) {
          logger.error(`No tab found for Dashboard: ${dataRow.dashboardName}. Skipping widget: ${dataRow.code}`);
          continue;
        }

        const systemViewTabMappingId = await getSystemViewTabMappingsId(tab?.id, tenant?.id);

        if (!systemViewTabMappingId) {
          logger.error(`No tab mapping found for Dashboard: ${dataRow.dashboardName}. Skipping widget: ${dataRow.code}`);
          continue;
        }

        let systemViewWidgetMasterId = await checkSystemViewWidgetMasterExists(dataRow.code);

        if (!systemViewWidgetMasterId) {
          logger.error(`No existing master widget found with code: ${dataRow.code}. Creating new master widget.`);
        }

        const systemViewTabWidgetMappingExists = await checkSystemViewTabWidgetMappingExists(systemViewTabMappingId, systemViewWidgetMasterId);

        if (!systemViewTabWidgetMappingExists) {
          logger.info(`Inserting new new tab mapping for tenant: ${tenant.name} (ID: ${tenant.id})`);
          await insertSystemViewTabWidgetMapping(systemViewTabMappingId, systemViewWidgetMasterId);
          logger.info(`New tab mapping inserted for tenant: ${tenant.name} (ID: ${tenant.id}) with master widget ID: ${systemViewWidgetMasterId} and Tab name: ${dataRow.tabName}\n`);
        } else {
          logger.warn(`Tab mapping already exists for tenant: ${tenant.name} (ID: ${tenant.id}) with master widget ID: ${systemViewWidgetMasterId} and Tab name: ${dataRow.tabName}. Skipping insertion.\n`);
        }
      }
    }
    logger.info("==============================================");
    logger.info("Tab mapping completed for selected tenants.");
    logger.info("==============================================");
  } catch (err) {
    logger.error("Error executing query", err.stack);
  }
}

// Run the process
processCSVData();
