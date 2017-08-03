#!/usr/bin/env node

import UploadToS3 from "./uploadToS3";
import { CloudFrontHandler } from "./cloudFront";
import Logger from "./logger";
import * as yargs from 'yargs';

export * from './releaseName';
export * from './configHandler';


const doUpload = (some) => {
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

const namedArgs = Object.assign({}, yargs.argv);
delete namedArgs._;
delete namedArgs.$0;
doUpload(namedArgs);