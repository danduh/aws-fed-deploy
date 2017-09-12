"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CF = require("aws-sdk/clients/cloudfront");
const configHandler_1 = require("./configHandler");
const Rx = require("rx");
const logger_1 = require("./logger");
class CloudFrontHandler extends configHandler_1.ConfigHandler {
    constructor(conf) {
        super(conf);
        this.AWS_CONFIG = Object.assign({ region: this.config.region, sslEnabled: false }, this.awsCred);
        this.init();
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
                logger_1.default.log(`CF Inavlidation \<${CFparams.DistributionId}\> started. ID: ${response.Invalidation.Id} Status: ${response.Invalidation.Status}`);
                observer.onNext(true);
                observer.onCompleted();
            }, (err) => {
                observer.onError(err);
                observer.onCompleted();
            });
        });
    }
}
exports.CloudFrontHandler = CloudFrontHandler;
//# sourceMappingURL=cloudFront.js.map