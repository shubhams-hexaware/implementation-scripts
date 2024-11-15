const fs = require("fs");
const csv = require("csv-parser");
const { checkSystemViewWidgetMasterExists, insertSystemViewWidgetMaster, checkSystemViewWidgetExists, insertSystemViewWidget, getsystemViewDashboardId, updateSystemViewWidgetMaster, updateSystemViewWidget } = require("../helpers/widgetHelper");
const { getAllTenantsHelper, getUATTenantsHelper, getProdUkTenantsHelper } = require("../helpers/tenantHelper");
const pgClient = require("../utils/pgClient");
const configuration = require("./config");
const logger = require("../utils/logger.js");
const { getProductByNameHelper } = require("../helpers/productHelper.js");

// Read data from CSV file and insert into database
// async function processCSVData() {
//   pgClient.initPool("TENSAI_DB", {
//     ...configuration.database.staging,
//     database: "tensaidb",
//   });

//   pgClient.initPool("TENSAI_AUTH_DB", {
//     ...configuration.database.staging,
//     database: "tensaiauthdb",
//   });

//   const tenants = await getAllTenantsHelper("Eurostar");
//   logger.info(`Fetched ${tenants.length} tenants.`);

//   const dataRows = [];

//   logger.info("Reading data from CSV file...");
//   fs.createReadStream("ServicePerformanceEurostarAll.csv")
//     .pipe(csv())
//     .on("data", (row) => {
//       dataRows.push(row);
//     })
//     .on("end", async () => {
//       logger.info(`CSV file successfully processed. ${dataRows.length} rows found.`);
//       await main(tenants, dataRows);
//     });
// }

// Read data from JSON file and insert into database
async function processJSONData() {
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

  logger.info("Reading data from JSON file...");
  const jsonData = await fs.promises.readFile("AIOpsMB.json", "utf-8");
  const dataRows = JSON.parse(jsonData);

  logger.info(`JSON file successfully processed. ${dataRows.length} rows found.`);
  await main(tenants, dataRows);
}

async function main(tenants, dataRows) {
  try {
    for (const tenant of tenants) {
      logger.info(`Processing data for tenant: ${tenant.name} (ID: ${tenant.id})`);

      for (const dataRow of dataRows) {
        logger.info(`Processing widget: ${dataRow.name} (Code: ${dataRow.code})\n`);

        // Parse systemViewDashboardId to ensure it's a number
        const systemViewDashboardId = await getsystemViewDashboardId(dataRow.dashboardName);

        if (!systemViewDashboardId) {
          logger.error(`No Dashboard Found named - ${dataRow.dashboardName}. Skipping widget: ${dataRow.name}`);
          continue;
        }

        const product = await getProductByNameHelper({ tenantId: tenant?.id, productMasterId: dataRow.productMasterId });

        if (!product) {
          logger.error(`No product found for tenant: ${tenant.name} (ID: ${tenant.id}). Skipping widget: ${dataRow.name}`);
          continue;
        }
        logger.info(`Product Found: ${product.name}`);

        const urlToExtract = JSON.parse(product?.productConfigurationJson).baseUrl;
        const originalUrl = dataRow?.widgetProductLink;
        let updatedUrl;

        if (originalUrl && urlToExtract) {
          // Extract the domain part from the second URL
          const domainPattern = /^(https:\/\/[^/]+)/;
          const match = urlToExtract.match(domainPattern);
          updatedUrl = originalUrl;

          if (match) {
            const newDomain = match[1];
            // Replace the domain in the original URL with the new domain
            updatedUrl = originalUrl.replace(domainPattern, newDomain);
            logger.info(`URL Updated: ${updatedUrl}`);
          } else {
            logger.error("URL pattern not found in the URL to extract");
          }
        } else {
          logger.error(`Original URL or URL to extract is missing. Skipping widget: ${dataRow.name}`);
          // continue;
        }

        let systemViewWidgetMasterId = await checkSystemViewWidgetMasterExists(dataRow.code);

        if (!systemViewWidgetMasterId) {
          logger.error(`No existing master widget found with code: ${dataRow.code}. Creating new master widget.`);
          systemViewWidgetMasterId = await insertSystemViewWidgetMaster(systemViewDashboardId, dataRow.name, dataRow.description, dataRow.code, dataRow.widgetConfigurationTemplate, dataRow.subTitle);
          logger.info(`New master widget created with ID: ${systemViewWidgetMasterId}`);
        } else {
          logger.warn(`Found existing master widget with ID: ${systemViewWidgetMasterId} for code: ${dataRow.code}`);
          // Update the existing master widget
          systemViewWidgetMasterId = await updateSystemViewWidgetMaster(systemViewDashboardId, dataRow.name, dataRow.description, dataRow.code, dataRow.widgetConfigurationTemplate, dataRow.subTitle);
          logger.info(`Master widget updated with ID: ${systemViewWidgetMasterId}`);
        }

        const widgetExists = await checkSystemViewWidgetExists(systemViewWidgetMasterId, tenant.id);

        if (!widgetExists) {
          logger.info(`Inserting new widget for tenant: ${tenant.name} (ID: ${tenant.id})`);
          await insertSystemViewWidget(systemViewWidgetMasterId, tenant.id, product?.id, dataRow.widgetConfigurationJSON, updatedUrl);
          logger.info(`New widget inserted for tenant: ${tenant.name} (ID: ${tenant.id}) with master widget ID: ${systemViewWidgetMasterId}\n`);
        } else {
          logger.warn(`Widget already exists for tenant: ${tenant.name} (ID: ${tenant.id}) with master widget ID: ${systemViewWidgetMasterId}.`);
          // Update the existing widget
          await updateSystemViewWidget(systemViewWidgetMasterId, tenant.id, product?.id, dataRow.widgetConfigurationJSON, updatedUrl);
          logger.info(`Widget updated for tenant: ${tenant.name} (ID: ${tenant.id}) with master widget ID: ${systemViewWidgetMasterId}\n`);
        }
      }
    }
    logger.info("==============================================");
    logger.info("Data insertion completed for selected tenants.");
    logger.info("==============================================");
  } catch (err) {
    logger.error("Error executing query", err.stack);
  }
}

// Run the process
// processCSVData();

processJSONData();
