require("dotenv").config({ path: "../.env" });
const { parseCsv } = require("../utils/csvUtils");
const axios = require("axios");
const HtmlCreator = require("html-creator");
const prompt = require("async-prompt");
const { getTenantByNameHelper, getAssignmentGroupsByTenantId } = require("../helpers/tenantHelper");
const { getProductByNameHelper } = require("../helpers/productHelper");
const logger = require("../utils/logger");
const configuration = require("./config");
const pgClient = require("../utils/pgClient");
const fs = require("fs");

/* CONSTANTS */
const BASE_URL = process.env.SERVICE_NOW_BASE_URL;

const TABLE_NAMES = {
  incident_list: "table/incident",
  incident_sla_list: "table/incident_sla",
  sc_task_list: "table/sc_task",
  sc_task_sla_list: "table/sc_task_sla",
  task_sla_list: "table/task_sla",
  change_request_list: "table/change_request",
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

async function fetch(url, product) {
  try {
    const response = await axios.get(url, {
      auth: {
        username: product?.auth?.credentials?.username,
        password: product?.auth?.credentials?.password,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`fetch -> error is`, error);
    throw new Error(error.message);
  }
}

function formatUrl(rawUrl, assignmentGroups, product) {
  let tempUrl = product.baseUrl + rawUrl;

  const url = new URL(tempUrl, BASE_URL);

  let sysParam = url.searchParams.get("sysparm_query");
  // adding the assignment groups
  url.searchParams.set("sysparm_query", sysParam + "^" + assignmentGroups);

  const rawTableName = Object.keys(TABLE_NAMES).find((tableName) => url.pathname.includes(tableName));

  if (!rawTableName) {
    throw new Error(`Unable to find the table name for ${rawTableName}`);
  }

  return url.protocol + "//" + url.host + "/api/now/" + TABLE_NAMES[rawTableName] + `?${url.searchParams.toString()}`;
}

async function processCsv(data, assignmentGroups, product) {
  const results = [];

  for (let counter = 0; counter < data.length; counter++) {
    const { widgetName, url } = data[counter];

    if (!url) {
      console.error(`URL not defined for ${widgetName}`);
      results.push({
        widgetName,
        url: "",
        response: "URL not provided",
      });
      continue;
    }

    const formattedUrl = formatUrl(url, assignmentGroups, product);

    try {
      // invoke the API
      const data = await fetch(formattedUrl, product);

      // store the result
      results.push({
        widgetName,
        url: formattedUrl,
        response: data?.result[0],
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

function createHtmlReport(data, tenantInfo, product) {
  const html = new HtmlCreator([
    {
      type: "head",
      content: [
        {
          type: "title",
          content: "Table Example",
        },
        {
          type: "style",
          content: `
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
            @media screen and (max-width: 600px) {
              table, thead, tbody, th, td, tr {
                display: block;
              }
              th, td {
                box-sizing: border-box;
                width: 100%;
              }
            }
          `,
        },
      ],
    },
    {
      type: "body",
      content: [
        {
          type: "div",
          attributes: { class: "info" },
          content: [
            { type: "p", content: `Tenant ID: ${tenantInfo.id}` },
            { type: "p", content: `Tenant Name: ${tenantInfo.name}` },
            { type: "p", content: `Product Name: ${product.name}` },
          ],
        },
        {
          type: "table",
          attributes: { border: "1" },
          content: [
            {
              type: "tr",
              content: [
                { type: "th", content: "Widget Name" },
                { type: "th", content: "URL" },
                { type: "th", content: "Response" },
              ],
            },
            ...data.map((item) => ({
              type: "tr",
              content: [
                { type: "td", content: item.widgetName },
                { type: "td", content: item.url },
                { type: "td", content: JSON.stringify(item.response) },
              ],
            })),
          ],
        },
      ],
    },
  ]);

  fs.writeFileSync(`${tenantInfo.name}-validator-result.html`, html.renderHTML());
}

(async function main() {
  pgClient.initPool("TENSAI_DB", {
    ...configuration.database.test,
    database: "tensaidb",
  });

  pgClient.initPool("TENSAI_AUTH_DB", {
    ...configuration.database.test,
    database: "tensaiauthdb",
  });

  const tenantName = await prompt("Enter the tenant name ");

  if (!tenantName) {
    throw new Error("Tenant name is required");
  }

  const tenant = await getTenantByNameHelper(tenantName);

  const product = await getProductByNameHelper({ tenantId: tenant?.id, productName: "ServiceNow" });

  const assignmentGroup = await getAssignmentGroupsByTenantId(tenant?.id);

  const assignmentGroups = JSON.parse(assignmentGroup?.assignmentGroupListSelectedJson)?.map((obj) => obj.sys_id);

  const data = await parseCsv("./service_insights-aging_inc&tasks.csv");

  const serviceNowData = await processCsv(data, assignmentGroups.join(",") ?? [], JSON.parse(product?.productConfigurationJson));

  await createHtmlReport(serviceNowData, tenant, product);
})();
