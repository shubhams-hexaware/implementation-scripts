require("dotenv").config({ path: "../.env" });
const { parseCsv } = require("../utils/csvUtils");
const axios = require("axios");
const HtmlCreator = require("html-creator");
const prompt = require("async-prompt");
const { getTenantByNameHelper } = require("../helpers/tenantHelper");
const { getProductByNameHelper } = require("../helpers/productHelper");


/* CONSTANTS */
const BASE_URL = process.env.SERVICE_NOW_BASE_URL;

const TABLE_NAMES = {
  incident_list: "stats/incident",
  incident_sla_list: "stats/incident_sla",
  sc_task_list: "stats/sc_task",
  sc_task_sla_list: "stats/sc_task_sla",
  task_sla_list: "stats/task_sla",
  change_request_list: "stats/change_request",
};

/* REPORT TEMPLATE */
const htmlHeadTag = {
  type: "head",
  content: [
    {
      type: "title",
      content: "Tensai | Service Now | API Validator",
    },
  ],
};

const tableHeaderTag = {
  type: "thead",
  content: [
    {
      type: "tr",
      content: [
        { type: "th", content: "Widget Name" },
        { type: "th", content: "API" },
        { type: "th", content: "Response " },
      ],
    },
  ],
};

const table = {};

async function fetch(url) {
  try {
    const response = await axios.get(url, {
      auth: {
        username: process.env.SERVICE_NOW_USERNAME,
        password: process.env.SERVICE_NOW_PASSWORD,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`fetch -> error is`, error);
    throw new Error(error.message);
  }
}

function formatUrl(rawUrl) {
  const url = new URL(rawUrl, BASE_URL);

  let sysParam = url.searchParams.get("sys_parm");
  // adding the assignment groups
  url.searchParams.set("sys_parm", sysParam + assignmentGroups.join(","));

  const rawTableName = Object.keys(TABLE_NAMES).find((tableName) =>
    url.pathname.includes(tableName),
  );

  if (!rawTableName) {
    throw new Error(`Unable to find the table name for ${rawTableName}`);
  }

  return [
    url.protocol,
    url.host,
    "/api/now/",
    TABLE_NAMES[rawTableName],
    `?${url.searchParams.toString()}`,
  ].join();
}

async function processCsv(data) {
  const results = [];

  for (let counter = 0; counter < data.length; counter++) {
    const [widgetName, url] = data[counter];

    if (!url) {
      console.error(`URL not defined for ${widgetName}`);
      results.push({
        widgetName,
        url: "",
        response: "URL not provided",
      });
      continue;
    }

    const formattedUrl = formatUrl(url);

    try {
      // invoke the API
      const data = await fetch(formattedUrl);

      // store the result
      results.push({
        widgetName,
        url: formattedUrl,
        response: data,
      });
    } catch (e) {
      results.push({
        widgetName,
        url: formattedUrl,
        response: e.message,
      });
    }
  }

  return results;
}

function createHtmlReport(data) {
  const htmlCreator = new HtmlCreator([
    htmlHeadTag,
    {
      type: "body",
      content: [
        {
          type: "h1",
          content: "Service Now | API Validator",
        },
        {
          type: "table",
          attributes: { id: "resultTable" },
          content: [tableHeaderTag, table],
        },
      ],
    },
  ]);

  const html = htmlCreator.renderHTMLToFile("validator-result.html");
}

(async function main() {
  const tenantName = await prompt("Enter the tenant name ").trim();

  if (!tenantName) {
    // throw an error
  }

  const tenant = await getTenantByNameHelper(tenantName);

  const product = await getProductByNameHelper("ServiceNow");

  // TODO: get the assignment groups from the DB

  const data = await parseCsv("./service-insights-api.csv");

  const serviceNowData = await processCsv(data);

  // TODO: generate and save HTML report
})();


