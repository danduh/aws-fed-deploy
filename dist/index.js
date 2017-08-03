"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const uploadToS3_1 = require("./uploadToS3");
const cloudFront_1 = require("./cloudFront");
const logger_1 = require("./logger");
__export(require("./releaseName"));
__export(require("./configHandler"));
exports.doUpload = (some) => {
    let uploader = new uploadToS3_1.default(some);
    let cloudFront = new cloudFront_1.CloudFrontHandler(some);
    uploader.startUploadProcess()
        .subscribe((response) => {
        logger_1.default.log('Uploading process dine successfully :) !!!');
        cloudFront.clearCFCache()
            .subscribe((response) => {
            logger_1.default.log('Cache will be cleaned');
        }, (error) => {
            logger_1.default.error('looks like we have problem with cache cleaning', error);
        });
    });
};
const mr = require("make-runnable");
mr;
//# sourceMappingURL=index.js.map