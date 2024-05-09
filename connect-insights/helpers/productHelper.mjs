import pgClient from "../utils/pgClient.mjs";
import logger from "../utils/logger.mjs";

class ProductHelper {

  #pgClient;

  constructor() {
    this.#pgClient = pgClient.getPool("TENSAI_DB");
  }

  async getProductByNameHelper({ tenantId, productName }) {
    logger.info(`getProductByNameHelper -> product name is ${productName}`);

    const { rows: products } = await this.#pgClient.query(`
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
}

export default ProductHelper;