require("dotenv").config({ path: "../.env" });

const configuration = {
  authorizationToken: process.env.CONNECT_INSIGHTS_AUTHORIZATION_TOKEN,
  database: {
    dev: {
      user: process.env.DEV_DB_USER,
      password: process.env.DEV_DB_PASSWORD,
      host: process.env.DEV_DB_HOST,
      port: process.env.DEV_DB_PORT,
    },
    test: {
      user: process.env.TEST_DB_USER,
      password: process.env.TEST_DB_PASSWORD,
      host: process.env.TEST_DB_HOST,
      port: process.env.TEST_DB_PORT,
    },
  },
};

module.exports = configuration;
