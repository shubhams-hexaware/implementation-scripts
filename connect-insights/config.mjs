import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

const configuration = {
  authorizationToken: process.env.CONNECT_INSIGHTS_AUTHORIZATION_TOKEN,
  database: {
    test: {
      user: process.env.TEST_DB_USER,
      password: process.env.TEST_DB_PASSWORD,
      host: process.env.TEST_DB_HOST,
      port: process.env.TEST_DB_PORT,
    }
  }
};

export default configuration;

