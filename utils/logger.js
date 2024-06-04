const chalk = require("chalk");

function log(message, metadata) {
  console.log(chalk.blue("INFO | ", message), metadata);
}

function info(message, metadata) {
  console.info(chalk.blue("INFO | ", message), metadata);
}

function warn(message, metadata) {
  console.warn(chalk.yellow("WARN | ", message), metadata);
}

function error(message, metadata) {
  console.error(chalk.red("ERROR | ", message), metadata);
}

export default {
  log,
  info,
  warn,
  error,
}