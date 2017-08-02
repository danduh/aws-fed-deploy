import Logger from "./logger";
import * as minimist from 'minimist';
import * as path from "path";
import * as fs from "fs";
import { isNullOrUndefined } from "util";

export interface Config {
    S3Bucket: string,
    releaseVersion: string,
    sourceFolder: string
    distFolder: string; //'./dist',
    region: string; //'eu-west-1',
    DistributionId: string; // 'E1MJ7C07S228NM',
    ItemsToInvalidate: string[]; //['/*', '/index.html', '/service-worker.js'],
    ApplicationName: string; // "Compit2_SPA",
    EnvironmentName: string; // "INTEGRATION"
}

export class ConfigHandler {
    public awsCred: { accessKeyId: string, secretAccessKey: string };
    public options: any;
    public config: Config;

    constructor() {
        this.getCliConfig();
        this.getAwsCredentials();
    }

    private loadJson(path) {
        let content = fs.readFileSync(path);
        return JSON.parse(content.toString());
    }

    private getCliConfig() {
        try {
            let knownOptions = {
                string: 'dpl-config'
            };
            this.options = minimist(process.argv.slice(2), knownOptions);

            if (!this.options['dpl-config'] || this.options['dpl-config'] == undefined) {
                throw new Error('<dpl-config> have to be provided');
            } else {
                this.options.configFile = `${process.cwd()}/${this.options['dpl-config']}`;
                Logger.log(`config file paths: ${this.options.configFile}`);
                this.config = this.loadJson(this.options.configFile);

                if (typeof this.config.distFolder === 'string' && this.config.distFolder.slice(-1) !== '/') {
                    this.config.distFolder += '/'
                }
            }

        } catch (err) {
            Logger.error('AWS credentials init failed', err);
        }
    }

    getAwsCredentials() {
        try {
            this.awsCred = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            };
            if (isNullOrUndefined(this.awsCred.accessKeyId) || isNullOrUndefined(this.awsCred.secretAccessKey))
                throw new Error('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is missing');

            Logger.log('AWS credentials init success');
        } catch (err) {
            Logger.error('AWS credentials init failed', err);
        }
    }
}

