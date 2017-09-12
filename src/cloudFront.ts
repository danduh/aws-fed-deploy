import * as CF from "aws-sdk/clients/cloudfront";
import { Config, ConfigHandler } from "./configHandler";
import * as CloudFront from "aws-sdk/clients/cloudfront";
import * as Rx from 'rx';
import Logger from "./logger";

export class CloudFrontHandler extends ConfigHandler {
    config: Config;
    CF: CloudFront;
    AWS_CONFIG;
    CF_createInvalidation;

    constructor(conf) {
        super(conf);
        this.AWS_CONFIG = Object.assign({region: this.config.region,  sslEnabled: false}, this.awsCred);
        this.init()
    }

    init() {
        this.CF = new CF(this.AWS_CONFIG);
        this.CF_createInvalidation = Rx.Observable.fromNodeCallback(this.CF.createInvalidation.bind(this.CF));
    }

    clearCFCache() {
        return Rx.Observable.create((observer) => {
            let CFparams = {
                DistributionId: this.config.DistributionId,
                InvalidationBatch: {
                    CallerReference: 'RANDOM_' + Date.now().toString(),
                    Paths: {
                        Quantity: this.config.ItemsToInvalidate.length,
                        Items: this.config.ItemsToInvalidate
                    }
                }
            };

            this.CF_createInvalidation(CFparams)
                .subscribe((response) => {
                    Logger.log(`CF Inavlidation \<${CFparams.DistributionId}\> started. ID: ${response.Invalidation.Id} Status: ${response.Invalidation.Status}`);
                    observer.onNext(true);
                    observer.onCompleted();
                }, (err) => {
                    observer.onError(err);
                    observer.onCompleted();
                })
        })

    }
}
