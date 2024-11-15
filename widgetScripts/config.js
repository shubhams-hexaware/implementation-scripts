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
    uat: {
      user: process.env.UAT_DB_USER,
      password: process.env.UAT_DB_PASSWORD,
      host: process.env.UAT_DB_HOST,
      port: process.env.UAT_DB_PORT,
    },
    staging: {
      user: process.env.STAGING_DB_USER,
      password: process.env.STAGING_DB_PASSWORD,
      host: process.env.STAGING_DB_HOST,
      port: process.env.STAGING_DB_PORT,
    },
    prod: {
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
      host: process.env.PROD_DB_HOST,
      port: process.env.PROD_DB_PORT,
    },
    prodUk: {
      user: process.env.PROD_UK_DB_USER,
      password: process.env.PROD_UK_DB_PASSWORD,
      host: process.env.PROD_UK_DB_HOST,
      port: process.env.PROD_UK_DB_PORT,
    },
  },
};

module.exports = configuration;
