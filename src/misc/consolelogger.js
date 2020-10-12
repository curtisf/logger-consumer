const chalk = require('chalk')
const util = require('util')

module.exports = {
  info: (...contents) => console.log(`${chalk.grey(new Date().toLocaleString())} ${chalk.whiteBright('INFO:', contents)}`),
  command: (...contents) => console.log(`${chalk.grey(new Date().toLocaleString())} ${chalk.magenta('COMMAND:')} ${chalk.whiteBright(contents)}`),
  debug: (...contents) => console.debug(`${chalk.grey(new Date().toLocaleString())} ${chalk.green('DEBUG')} ${chalk.whiteBright(util.inspect(contents, false, null, true))}`),
  warn: (...contents) => console.warn(`${chalk.grey(new Date().toLocaleString())} ${chalk.yellowBright('WARN')} ${chalk.whiteBright(contents)}`),
  error: (...contents) => {
    console.error(`${chalk.grey(new Date().toLocaleString())} ${chalk.redBright('ERROR')} ${chalk.whiteBright(contents && contents[0].stack && contents[0].message ? contents[0].stack : contents)}`)
  },
  fatal: (...contents) => {
    // leave space for sentry
    console.error(`${chalk.grey(new Date().toLocaleString())} ${chalk.redBright('ERROR')} ${chalk.whiteBright(contents && contents[0].stack && contents[0].message ? contents[0].stack : contents)}`)
    process.exit(1)
  }
}
