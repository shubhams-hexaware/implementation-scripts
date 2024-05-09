import configuration from "../config.mjs";
import logger from "../utils/logger.mjs";
import prompt from "async-prompt";
import TenantHelper from "../helpers/tenantHelper.mjs";
import ProductHelper from "../helpers/productHelper.mjs";
import pgClient from "../utils/pgClient.mjs";
import AmazonConnectHelper from "../helpers/amazonConnectHelper.js";

/**
 * Accept the tenant name from the user
 * Get the tenant details
 * Get the product and product configuration
 *
 * Run the functions for the realtime metrics
 * Run the functions for Historical metrics for Today
 * Generate the HTML report
 * Run the functions for Historical metrics for Last 7 days
 * Generate the HTML report
 */
(async function main() {
  console.log(configuration.database.test);
  pgClient.initPool("TENSAI_DB", {
    ...configuration.database.test,
    database: "tensaidb",
  });

  pgClient.initPool("TENSAI_AUTH_DB", {
    ...configuration.database.test,
    database: "tensaiauthdb",
  });

  const tenantName = await prompt(`Enter the tenant name `);

  if (!tenantName) {
    throw new Error(`Please provide a tenant name and try again.`);
  }

  const tenantHelper = new TenantHelper();
  const tenant = await tenantHelper.getTenantByNameHelper(tenantName);

  if (!tenant) {
    logger.error(`Unable to find tenant with name ${tenantName}`);

    throw new Error(`Please check the tenant name and try again`);
  }

  const productHelper = new ProductHelper();
  const product = await productHelper.getProductByNameHelper({
    tenantId: tenant.id,
    productName: 'AWS Connect',
  });

  const productConfiguration = JSON.parse(product.productConfigurationJson);
  const apiUrl = productConfiguration.baseUrl;

  const awsConnectService = new AmazonConnectHelper(apiUrl);


})();