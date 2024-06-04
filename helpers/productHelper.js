const pgClient = require("../utils/pgClient.js");
const logger = require("../utils/logger.js");

exports.getProductByNameHelper = async function getProductByNameHelper({ tenantId, productName }) {
  logger.info(`getProductByNameHelper -> product name is ${productName}`);

  const pool = pgClient.getPool("TENSAI_DB");

  const { rows: products } = await pool.query(`
    SELECT p.id,
      p.name,
      p."productConfigurationId",
      pc."productConfigurationJson" as "productConfigurationJson"
    FROM product p, productconfiguration pc
    WHERE p."productConfigurationId" = pc.id 
    AND p."tenantId" = $1
    AND p."name" = $2
  `, [tenantId, productName]);

  return products?.[0] ?? null;
}