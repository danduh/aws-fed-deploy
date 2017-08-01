import { ConfigHandler } from "./configHandler";
import S3 = require("aws-sdk/clients/s3");
import Logger from "./logger";
import * as Rx from 'rx';
import { DeleteObjectsOutput } from "aws-sdk/clients/s3";
import { Observable } from "rxjs/Observable";

export default class UploadToS3 extends ConfigHandler {
    config;
    AWS_CONFIG;
    S3: S3;
    getListOfFiles;
    deleteListOfFiles;

    constructor() {
        super();
        this.AWS_CONFIG = Object.assign({region: this.config.region}, this.awsCred);
        this.init()
    }

    init() {
        this.S3 = new S3(this.AWS_CONFIG);
        this.getListOfFiles = Rx.Observable.fromNodeCallback(this.S3.listObjects.bind(this.S3));
        this.deleteListOfFiles = Rx.Observable.fromNodeCallback(this.S3.deleteObjects.bind(this.S3));
        this.emptyFolder();
    }


    getContentFolder() {
        return Rx.Observable.create((observer) => {
            let S3Params = {
                Bucket: this.config.S3Bucket,
                Prefix: `${this.config.distFolder || ''}`
            };
            this.getListOfFiles(S3Params)
                .map((data) => {
                    return data.Contents.map((content) => {
                        return {Key: content.Key}
                    });
                })
                .subscribe((contents) => {
                    Logger.log(`[deleteListOfFiles], Number Of files in Folder  ${contents.length}`);
                    observer.next(contents);
                })
        });
    }

    deleteContentFolder(contents) {
        return Rx.Observable.create((observer) => {
            let S3Params = {
                Bucket: this.config.S3Bucket,
                Delete: {
                    Objects: contents
                }
            };
            console.log(contents);
            return this.deleteListOfFiles(S3Params)
                .subscribe((_contents) => {
                    Logger.log(`[deleteListOfFiles], Number Of Removed Files:  ${_contents.Deleted.length}`);
                    observer.next(_contents);
                })
        });

    }

    emptyFolder(isDone: boolean = false) {
        if (isDone) {
            Logger.log('WE DONE!!!!');
            return;
        }

        let $this = this;
        let call = () => {
            return this.getContentFolder()
                .flatMap(this.deleteContentFolder.bind(this));
        };

        let state$ = call();

        let sub = state$.subscribe(function (response) {
            if (response.Deleted.length != 1000) {
                Logger.log('Looks like we done here');
                $this.emptyFolder(true);
            } else {
                Logger.log('Looks like we should continue');
                $this.emptyFolder();
            }
            sub.dispose();
        });


        // let _subscriber = this.deleteListOfFiles(S3Params)
        //     .map((response) => {
        //         if (response.Deleted.length == 1000)
        //             throw 'There is MORE to delete';
        //     })
        //     .retryWhen((message) => {
        //         return message.do((val) => console.log('valvalvalval', val))
        //     });
        //
        // _subscriber.subscribe((response: DeleteObjectsOutput) => {
        //     console.log('Number Of deleted items: ', response);
        //     // console.log('Number Of deleted items: ', response.Deleted.length);
        //
        //     // if (response.Errors.length > 0)
        //     //     this.errorHandler(response.Errors);
        //
        // }, this.errorHandler.bind(this))
        //
        // this.S3.deleteObjects(S3Params, function (err, data) {
        //     if (err) {
        //         callback(err);
        //         reject(err);
        //     } else if (data.Deleted.length == 1000) {
        //         emptyBucket();
        //     } else {
        //         resolve(data.Deleted.length);
        //     }
        // });
    }

    // this.S3.listObjects(S3Params, function (err, data) {
    //     if (err) {
    //         Logger.error(err.stack);
    //     } else {
    //         data.Contents.forEach(function (content) {
    //             console.log({Key: content.Key});
    //         });
    //     }
    // };
    // return new Promise(function (resolve, reject) {
    //     let filesCount = 0;
    //
    //     function emptyBucket() {
    //         this.S3.listObjects(S3Params, function (err, data) {
    //             if (err) {
    //                 Logger.error(err.stack);
    //                 reject(err);
    //             }
    //             filesCount = data.Contents.length;
    //             if (filesCount == 0) {
    //                 resolve('done')
    //             }
    //
    //             S3Params = {
    //                 Bucket: params.SourceBundle.S3Bucket,
    //                 Delete: {
    //                     Objects: []
    //                 }
    //             };
    //
    //             data.Contents.forEach(function (content) {
    //                 S3Params.Delete.Objects.push({Key: content.Key});
    //             });
    //
    //             S3.deleteObjects(S3Params, function (err, data) {
    //                 if (err) {
    //                     callback(err);
    //                     reject(err);
    //                 } else if (data.Deleted.length == 1000) {
    //                     emptyBucket();
    //                 } else {
    //                     resolve(data.Deleted.length);
    //                 }
    //             });
    //         });
    //     }
    //
    //     emptyBucket()
    // });
    // }


    // uploadFolder(config, folderName) {
    //
    //     return new Promise(function (resolve, reject) {
    //
    //         params = config;
    //         if (!config.region || !aws_cred.AWS_SECRET_ACCESS_KEY || !aws_cred.AWS_ACCESS_SKEY_ID) {
    //             throw new Error('Region, AWS_KEY, AWS_SECRET_KEY required!!!');
    //         }
    //
    //         let AWS_CONFIG = {
    //             region: config.region,
    //             accessKeyId: aws_cred.AWS_ACCESS_SKEY_ID,
    //             secretAccessKey: aws_cred.AWS_SECRET_ACCESS_KEY
    //         };
    //
    //         S3 = new AWS.S3(AWS_CONFIG);
    //         let numRemovedFiles = 0;
    //         logger('STARTED');
    //         removeFolder(params).then((numRemovedFiles) => {
    //
    //             logger(`Removed ${numRemovedFiles} files from [${params.SourceBundle.envFolder}current/] folder`);
    //
    //             glob(`${folderName}/**/*.*`, function (er, files) {
    //
    //                 async function doAsync() {
    //                     try {
    //                         let version = files.map(async (entry) => {
    //                             let fileName = entry.replace(`${folderName}/`, '');
    //                             let S3Params = {
    //                                 ACL: "public-read",
    //                                 Bucket: params.SourceBundle.S3Bucket,
    //                                 Key: params.SourceBundle.envFolder + 'current/' + fileName,
    //                                 ContentType: mime.lookup(fileName)
    //                             };
    //                             if (fileName.indexOf('index.html') != -1) {
    //                                 S3Params.CacheControl = 'no-store';
    //                             }
    //                             if (fileName.indexOf('robots.txt') != -1) {
    //                                 S3Params.Key = `${params.SourceBundle.envFolder}current/robots.txt`;
    //                             }
    //                             await uploadFile(entry, S3Params);
    //                         });
    //                         await Promise.all(release.concat(version));
    //
    //                     } catch (err) {
    //                         callback(err)
    //                     }
    //                     clearS3Cache(config);
    //                     logger('FINISHED');
    //                 }
    //
    //                 doAsync();
    //
    //             });
    //         });
    //
    //     });
    // }
    //
    errorHandler(err) {
        console.error(err);
    }
}


