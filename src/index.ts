import UploadToS3 from "./uploadToS3";
import { CloudFrontHandler } from "./cloudFront";
import Logger from "./logger";

export * from './releaseName';
export * from './configHandler';


export const doUpload = (some) => {
    let uploader = new UploadToS3(some);
    let cloudFront = new CloudFrontHandler(some);
    uploader.startUploadProcess()
        .subscribe((response) => {
            Logger.log('Uploading process dine successfully :) !!!');
            cloudFront.clearCFCache()
                .subscribe((response) => {
                    Logger.log('Cache will be cleaned')
                }, (error) => {
                    Logger.error('looks like we have problem with cache cleaning', error)
                });
        });

};

import * as mr from 'make-runnable'
import { ConfigHandler } from "./configHandler";

mr