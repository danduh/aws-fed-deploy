import { ConfigHandler } from "./configHandler";
import S3 = require("aws-sdk/clients/s3");
import Logger from "./logger";
import * as Rx from 'rx';

export default class UploadToS3 extends ConfigHandler {
    config;
    AWS_CONFIG;
    S3: S3;
    getListOfFiles;

    constructor() {
        super();
        this.AWS_CONFIG = Object.assign({region: this.config.region}, this.awsCred);
        console.log(this.config)
        this.init()
    }

    init() {
        this.S3 = new S3(this.AWS_CONFIG);
        this.getListOfFiles = Rx.Observable.fromNodeCallback(this.S3.listObjects.bind(this.S3));

        this.removeFolder()
    }


    removeFolder() {
        let S3Params = {
            Bucket: this.config.S3Bucket,
            Prefix: `${this.config.distFolder || ''}current/`
        };

        this.getListOfFiles(S3Params)
            .subscribe((data) => {
                data.Contents.forEach(function (content) {
                    console.log({Key: content.Key});
                });
            })

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
    }


    uploadFolder(config, folderName) {

        return new Promise(function (resolve, reject) {

            params = config;
            if (!config.region || !aws_cred.AWS_SECRET_ACCESS_KEY || !aws_cred.AWS_ACCESS_SKEY_ID) {
                throw new Error('Region, AWS_KEY, AWS_SECRET_KEY required!!!');
            }

            let AWS_CONFIG = {
                region: config.region,
                accessKeyId: aws_cred.AWS_ACCESS_SKEY_ID,
                secretAccessKey: aws_cred.AWS_SECRET_ACCESS_KEY
            };

            S3 = new AWS.S3(AWS_CONFIG);
            let numRemovedFiles = 0;
            logger('STARTED');
            removeFolder(params).then((numRemovedFiles) => {

                logger(`Removed ${numRemovedFiles} files from [${params.SourceBundle.envFolder}current/] folder`);

                glob(`${folderName}/**/*.*`, function (er, files) {

                    async function doAsync() {
                        try {
                            let version = files.map(async (entry) => {
                                let fileName = entry.replace(`${folderName}/`, '');
                                let S3Params = {
                                    ACL: "public-read",
                                    Bucket: params.SourceBundle.S3Bucket,
                                    Key: params.SourceBundle.envFolder + 'current/' + fileName,
                                    ContentType: mime.lookup(fileName)
                                };
                                if (fileName.indexOf('index.html') != -1) {
                                    S3Params.CacheControl = 'no-store';
                                }
                                if (fileName.indexOf('robots.txt') != -1) {
                                    S3Params.Key = `${params.SourceBundle.envFolder}current/robots.txt`;
                                }
                                await uploadFile(entry, S3Params);
                            });
                            await Promise.all(release.concat(version));

                        } catch (err) {
                            callback(err)
                        }
                        clearS3Cache(config);
                        logger('FINISHED');
                    }

                    doAsync();

                });
            });

        });
    }

}
