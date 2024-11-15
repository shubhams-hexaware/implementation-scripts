const HtmlCreator = require("html-creator");
const fs = require("fs");

const tableHeader = {
  type: "thead",
  content: [
    {
      type: "tr",
      content: [
        { type: "th", content: "Widget Name" },
        { type: "th", content: "API" },
        { type: "th", content: "Response "},
      ],
    }
  ]
};

const tableBody = {
  type: "tbody",
  content: [
    {
      type: "tr",
      content: [
        { type: "td", content: "Widget 1" },
        { type: "td", content: "https://api.example.com/stats/?query=1&param=1" },
        { type: "td", content: "Hello World!" }
      ]
    },
    {
      type: "tr",
      content: [
        { type: "td", content: "Widget 2" },
        { type: "td", content: "https://api.example.com/stats/?query=1&param=1" },
        { type: "td", content: "Hello World!" }
      ]
    },
    {
      type: "tr",
      content: [
        { type: "td", content: "Widget 2" },
        { type: "td", content: "https://api.example.com/stats/?query=1&param=1" },
        { type: "td", content: "Hello World!" }
      ]
    }
  ],
};

const htmlCreator = new HtmlCreator([
  {
    type: "head",
    content: [
      {
        type: "title",
        content: "HTML Test"
      }
    ]
  },
  {
    type: "body",
    content: [
      {
        type: "table",
        content: [
          tableHeader,
          tableBody
        ],
      },
    ],
  }
]);

const html = htmlCreator.renderHTML();
fs.writeFileSync("response.html", html);