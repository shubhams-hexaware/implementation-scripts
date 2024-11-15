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

function formatUrl(rawUrl, assignmentGroups, product, includeAssignmentGroups = true) {
  let tempUrl = product.baseUrl + rawUrl;
  const url = new URL(tempUrl);

  if (includeAssignmentGroups) {
    let sysParam = url.searchParams.get("sysparm_query");
    // Adding the assignment groups
    url.searchParams.set("sysparm_query", sysParam + "^" + assignmentGroups);
  }

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
        urlWithAssignmentGroups: "",
        urlWithoutAssignmentGroups: "",
        responseWithAssignmentGroups: "URL not provided",
        responseWithoutAssignmentGroups: "URL not provided",
      });
      continue;
    }

    const urlWithAssignmentGroups = formatUrl(url, assignmentGroups, product, true);
    const urlWithoutAssignmentGroups = formatUrl(url, assignmentGroups, product, false);

    try {
      // Invoke the API for URL with assignment groups
      const dataWithAssignmentGroups = await fetch(urlWithAssignmentGroups, product);
      const responseWithAssignmentGroups = dataWithAssignmentGroups?.result[0] || [];
      const countWithAssignmentGroups = dataWithAssignmentGroups?.result.length || [];

      // Invoke the API for URL without assignment groups
      const dataWithoutAssignmentGroups = await fetch(urlWithoutAssignmentGroups, product);
      const responseWithoutAssignmentGroups = dataWithoutAssignmentGroups?.result[0] || [];
      const countWithoutAssignmentGroups = dataWithoutAssignmentGroups?.result.length || [];

      // Store the results
      results.push({
        widgetName,
        urlWithAssignmentGroups,
        urlWithoutAssignmentGroups,
        responseWithAssignmentGroups,
        responseWithoutAssignmentGroups,
        countWithAssignmentGroups,
        countWithoutAssignmentGroups,
      });
    } catch (e) {
      results.push({
        widgetName,
        urlWithAssignmentGroups,
        urlWithoutAssignmentGroups,
        responseWithAssignmentGroups: e.message,
        responseWithoutAssignmentGroups: e.message,
        countWithAssignmentGroups: 0,
        countWithoutAssignmentGroups: 0,
      });
    }
  }

  return results;
}

function createHtmlReport(data, tenantInfo) {
  const pageTitle = `${tenantInfo.name} - ${tenantInfo.productName}`;
  const htmlContent = `
    <html>
      <head>
        <title>${pageTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          .info {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
            word-wrap: break-word;
          }
          th {
            background-color: #f2f2f2;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f1f1f1;
          }
          pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
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
        </style>
      </head>
      <body>
        <div class="info">
          <p>Tenant ID: ${tenantInfo.id}</p>
          <p>Tenant Name: ${tenantInfo.name}</p>
          <p>Product Name: ${tenantInfo.productName}</p>
        </div>
        <table border="1">
        <tr>
        <th>Widget Name</th>
        <th>URL with Assignment Groups</th>
        <th>Response with Assignment Groups</th>
        <th>URL without Assignment Groups</th>
        <th>Response without Assignment Groups</th>
      </tr>
      ${data
        .map(
          (item) => `
        <tr>
          <td>${item.widgetName}</td>
          <td><a href="${item.urlWithAssignmentGroups}" target="_blank">${item.urlWithAssignmentGroups}</a></td>
          <td>
          <div>Over all response count : ${item.countWithAssignmentGroups}</div>
          <div>Sample response object : ${JSON.stringify(item.responseWithAssignmentGroups)}</div>
          </td>
          <td><a href="${item.urlWithoutAssignmentGroups}" target="_blank">${item.urlWithoutAssignmentGroups}</a></td>
          <td>
          <div>Over all response count : ${item.countWithoutAssignmentGroups}</div>
          <div>Sample response object : ${JSON.stringify(item.responseWithoutAssignmentGroups)}</div>          
          </td>
        </tr>
          `
        )
        .join("")}
        </table>
      </body>
    </html>
  `;

  fs.writeFileSync(`${tenantInfo.name}-${tenantInfo.productName}-validator-result.html`, htmlContent);
}

(async function main() {
  try {
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

    const product = await getProductByNameHelper({ tenantId: tenant?.id, productMasterId: 2 });

    const assignmentGroup = await getAssignmentGroupsByTenantId(tenant?.id);

    const assignmentGroups = JSON.parse(assignmentGroup?.assignmentGroupListSelectedJson)?.map((obj) => obj.sys_id);

    const data = await parseCsv("./service_insights-aging_inc&tasks.csv");

    const serviceNowData = await processCsv(data, assignmentGroups.join(",") ?? [], JSON.parse(product?.productConfigurationJson));

    const tenantInfo = {
      id: tenant.id,
      name: tenant.name,
      productName: product.name,
    };

    await createHtmlReport(serviceNowData, tenantInfo);
    logger.info("HTML report generated successfully.");
  } catch (error) {
    logger.error("An error occurred:", error);
  }
})();
