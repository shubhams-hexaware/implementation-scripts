import pgClient from "../utils/pgClient.mjs";
import logger from "../utils/logger.mjs";

class TenantHelper {

  #pgClient;

  constructor() {
    this.#pgClient = pgClient.getPool('TENSAI_AUTH_DB');
  }

  async getTenantByNameHelper(tenantName) {
    logger.info(`getTenantByNameHelper -> tenant name is ${tenantName}`);

    const { rows: tenants } = await this.#pgClient.query(`
      SELECT id, name
      FROM tenant
      WHERE name like '%${tenantName}%'
    `);

    return tenants?.[0] ?? null;
  }
}


export default TenantHelper;