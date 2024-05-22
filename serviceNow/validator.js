require("dotenv/config");
const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
const assignmentGroups = require("./assignmentGroups.json");

const BASE_URL = process.env.SERVICE_NOW_BASE_URL;

async function parseCsv(filename) {
  return new Promise(resolve => {
    const data = [];
    fs.createReadStream(filename)
      .pipe(csv())
      .on("data", (row) => data.push(row))
      .on("end", () => resolve(data));
  });
}

async function fetch(url) {
  try {
    const response = await axios.get(url, {
      auth: {
        username: process.env.SERVICE_NOW_USERNAME,
        password: process.env.SERVICE_NOW_PASSWORD,
      }
    });

    return response.data;
  } catch (error) {
    console.error(`fetch -> error is`, error);
    throw new Error(error.message);
  }
}

const getTableNameFromUrl = (url) => url.split(".com/")[1];

const TABLE_NAMES = {
  "incident_list": "/api/now/stats/incident",
  "incident_sla_list": "/api/now/stats/incident_sla",
  "sc_task_list": "/api/now/stats/sc_task",
  "sc_task_sla_list": "/api/now/stats/sc_task_sla",
  "task_sla_list": "/api/now/stats/task_sla",
  "change_request_list": "/api/now/stats/change_request",
};

(async function main() {
  const data = await parseCsv('./service-insights-api.csv');

  for (let counter = 0; counter < data.length; counter++) {
    const [widgetName, url] = data[counter];

    if (!url) {
      console.error(`URL not defined for ${widgetName}`);
      continue;
    }

    let tableName;
    if (!url.includes('api')) {
      tableName = getTableNameFromUrl(url);
    }

    if (!tableName) {
      console.error(`Unknown table name in URL ${url}`);
      continue;
    }

    const apiUrl = new URL(url, BASE_URL);
    const sysParm = url.searchParams.get('sys_parm');

  }
})();
