"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const chalk = require("chalk");
let params = { EnvironmentName: 'define' };
class Logger {
    static log(msg) {
        console.log(util.format('[%s] %s', chalk.green('[' + params.EnvironmentName + ']'), msg));
    }
    ;
    static error(msg, err = null) {
        console.log(util.format('[%s] %s', chalk.red('[' + params.EnvironmentName + ']'), msg, err));
    }
    ;
}
exports.default = Logger;
//# sourceMappingURL=logger.js.map