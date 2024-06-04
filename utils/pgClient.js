const { Pool } = require("pg");
const logger = require("./logger.js");

class PgPool {
  #instance;
  #configuration;

  constructor(configuration) {
    this.#configuration = configuration;
    this.#instance = new Pool({
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

  getConfiguration() {
    const configuration = { ...this.#configuration };
    // removing the password property from the configuration object
    delete configuration.password;
    return configuration;
  }

  async query(queryString, values = []) {
    return this.#instance.query(queryString, values);
  }

  async end() {
    await this.#instance.end();
    this.#instance = null;
  }
}

class PgClient {
  #pools = {};

  initPool(name, configuration) {
    if (this.#pools[name]) {
      return this.#pools[name];
    }

    this.#pools[name] = new PgPool(configuration);
  }

  getPool(name) {
    if (!this.#pools[name]) {
      logger.error(`Please check if pool ${name} is initialized!`);

      throw new Error(`Please check if the ${name} pool is initialized`);
    }

    return this.#pools[name];
  }

  async end(name) {
    if (!this.#pools[name]) {
      return {
        name,
        isActive: false,
      };
    }

    await this.#pools[name].end();
    delete this.#pools[name];
  }
}

const pgClient = new PgClient();

module.exports = pgClient;