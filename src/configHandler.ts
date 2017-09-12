import Logger from "./logger";
import * as minimist from 'minimist';
import * as AWS from 'aws-sdk';
import * as fs from "fs";
import {isNullOrUndefined} from "util";

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
    AWSProfile: string;
}

export class ConfigHandler {
    config: Config;
    private configUrl: string;
    public awsCred: { accessKeyId: string, secretAccessKey: string } = null;
    public options: any;


    constructor(conf) {
        this.configUrl = conf.dplConfig;
        this.getConfig();
        this.getAwsCredentials();
    }

    private loadJson(path) {
        let content = fs.readFileSync(path);
        return JSON.parse(content.toString());
    }

    private getConfig() {
        this.config = this.loadJson(this.configUrl);

        if (typeof this.config.distFolder === 'string' && this.config.distFolder.slice(-1) !== '/') {
            this.config.distFolder += '/'
        }
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
        if(!!this.awsCred)
            return this.awsCred;

        try {
            if (!isNullOrUndefined(process.env.AWS_ACCESS_KEY_ID) && !isNullOrUndefined(process.env.AWS_ACCESS_KEY_ID)) {
                this.awsCred = {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                };
            } else if (!!this.config.AWSProfile) {
                Logger.log(`Using AWS Profile: ${this.config.AWSProfile}`);
                let _awsCred = new AWS.SharedIniFileCredentials({profile: this.config.AWSProfile});
                this.awsCred = {
                    accessKeyId: _awsCred.accessKeyId,
                    secretAccessKey: _awsCred.secretAccessKey
                };
            } else {
                throw new Error('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is missing');
            }

            Logger.log('AWS credentials init success');
        } catch (err) {
            Logger.error('AWS credentials init failed', err);
        }
    }
}

