"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const minimist = require("minimist");
const fs = require("fs");
const util_1 = require("util");
class ConfigHandler {
    constructor(conf) {
        this.configUrl = conf.dplConfig;
        this.getConfig();
        this.getAwsCredentials();
    }
    loadJson(path) {
        let content = fs.readFileSync(path);
        return JSON.parse(content.toString());
    }
    getConfig() {
        this.config = this.loadJson(this.configUrl);
        if (typeof this.config.distFolder === 'string' && this.config.distFolder.slice(-1) !== '/') {
            this.config.distFolder += '/';
        }
    }
    getCliConfig() {
        try {
            let knownOptions = {
                string: 'dpl-config'
            };
            this.options = minimist(process.argv.slice(2), knownOptions);
            if (!this.options['dpl-config'] || this.options['dpl-config'] == undefined) {
                throw new Error('<dpl-config> have to be provided');
            }
            else {
                this.options.configFile = `${process.cwd()}/${this.options['dpl-config']}`;
                logger_1.default.log(`config file paths: ${this.options.configFile}`);
                this.config = this.loadJson(this.options.configFile);
                if (typeof this.config.distFolder === 'string' && this.config.distFolder.slice(-1) !== '/') {
                    this.config.distFolder += '/';
                }
            }
        }
        catch (err) {
            logger_1.default.error('AWS credentials init failed', err);
        }
    }
    getAwsCredentials() {
        try {
            this.awsCred = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            };
            if (util_1.isNullOrUndefined(this.awsCred.accessKeyId) || util_1.isNullOrUndefined(this.awsCred.secretAccessKey))
                throw new Error('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is missing');
            logger_1.default.log('AWS credentials init success');
        }
        catch (err) {
            logger_1.default.error('AWS credentials init failed', err);
        }
    }
}
exports.ConfigHandler = ConfigHandler;
//# sourceMappingURL=configHandler.js.map