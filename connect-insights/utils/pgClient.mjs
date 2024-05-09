import pg from "pg";
import logger from "./logger.mjs";

const { Pool } = pg;

class PgPool {
  #instance;

  constructor(instance) {
    this.#instance = instance;
  }

  async query(queryString, values = []) {
    return this.#instance.query(queryString, values);
  }
}

class PgClient {
  #pools = {};

  initPool(name, configuration) {
    if (this.#pools[name]) {
      return this.#pools[name];
    }

    this.#pools[name] = new Pool({
      user: configuration.user,
      password: configuration.password,
      host: configuration.host,
      port: configuration.port,
      database: configuration.database,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  getPool(name) {
    if (!this.#pools[name]) {
      logger.error(`Please check if pool ${name} is initialized!`);

      throw new Error(`Please check if the ${name} pool is initialized`);
    }

    return this.#pools[name];
  }
}

const pgClient = new PgClient();

export default pgClient;