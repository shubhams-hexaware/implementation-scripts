const chalk = require("chalk");

exports.log = function log(message, metadata) {
  console.log(chalk.blue("INFO | ", message), metadata);
};

exports.info = function info(message, metadata) {
  console.info(chalk.blue("INFO | ", message), metadata);
};

exports.warn = function warn(message, metadata) {
  console.warn(chalk.yellow("WARN | ", message), metadata);
};

exports.error = function error(message, metadata) {
  console.error(chalk.red("ERROR | ", message), metadata);
};

// export default {
//   log,
//   info,
//   warn,
//   error,
// }
