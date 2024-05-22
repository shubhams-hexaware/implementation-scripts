const pg = require('pg');

class PgPool {
  #pool;

  constructor(pool) {
    this.#pool = pool;
  }

  async query(queryString, values = []) {
    return this.#pool.query(queryString, values);
  }
}

class PgClient {
  #pools = {};

  initPool(name, configuration) {
    if (this.#pools[name]) {
      return this.#pools[name];
    }

    const pool = new pg.Pool({
      host: configuration.host,
      port: configuration.port || 5432,
      user: configuration.user,
      password: configuration.password,
      ssl: {
        rejectUnauthorized: false,
      }
    });

    this.#pools[name] = new PgPool(pool);
  }

  getPool(name) {
    if (!this.#pools[name]) {
      console.error(`${name} connection pool is not initialized`);

      throw new Error(`Please initialize the connection pool ${name}`);
    }

    return this.#pools[name];
  }
}

const pgClient = new PgClient();

module.exports = pgClient;