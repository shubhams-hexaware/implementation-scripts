const fs = require("fs");
const csv = require("csv-parser");

exports.parseCsv = async function parseCsv(filename) {
  return new Promise((resolve) => {
    const data = [];
    fs.createReadStream(filename)
      .pipe(csv())
      .on("data", (row) => data.push(row))
      .on("end", () => resolve(data));
  });
}