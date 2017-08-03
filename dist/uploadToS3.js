"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configHandler_1 = require("./configHandler");
const S3 = require("aws-sdk/clients/s3");
const logger_1 = require("./logger");
const Rx = require("rx");
const glob = require("glob");
const mime = require("mime");
const fs = require("fs");
class UploadToS3 extends configHandler_1.ConfigHandler {
    constructor(conf) {
        super(conf);
        this.AWS_CONFIG = Object.assign({ region: this.config.region }, this.awsCred);
        this.init();
    }
    init() {
        this.S3 = new S3(this.AWS_CONFIG);
        this.S3_listObjects = Rx.Observable.fromNodeCallback(this.S3.listObjects.bind(this.S3));
        this.S3_deleteObjects = Rx.Observable.fromNodeCallback(this.S3.deleteObjects.bind(this.S3));
        this.S3_upload = Rx.Observable.fromNodeCallback(this.S3.upload.bind(this.S3));
        this.globRX = Rx.Observable.fromNodeCallback(glob);
        this.fs_readFile = Rx.Observable.fromNodeCallback(fs.readFile.bind(fs));
    }
    doneWithUploading() {
    }
    startUploadProcess() {
        return Rx.Observable.create((observer) => {
            this.observer = observer;
            this.emptyFolder(false);
            return function () {
                console.log('disposed');
            };
        });
    }
    getContentFolder() {
        return Rx.Observable.create((observer) => {
            let S3Params = {
                Bucket: this.config.S3Bucket,
                Prefix: `${this.config.distFolder || ''}`
            };
            this.S3_listObjects(S3Params)
                .map((data) => {
                return data.Contents.map((content) => {
                    return { Key: content.Key };
                });
            })
                .subscribe((contents) => {
                logger_1.default.log(`[deleteListOfFiles], Number Of files in Folder  ${contents.length}`);
                observer.next(contents);
            });
        });
    }
    deleteContentFolder(contents) {
        return Rx.Observable.create((observer) => {
            if (contents.length === 0) {
                observer.next(null);
            }
            let S3Params = {
                Bucket: this.config.S3Bucket,
                Delete: {
                    Objects: contents
                }
            };
            return this.S3_deleteObjects(S3Params)
                .subscribe((_contents) => {
                logger_1.default.log(`[deleteListOfFiles], Number Of Removed Files:  ${_contents.Deleted.length}`);
                observer.next(_contents);
            });
        });
    }
    emptyFolder(isDone = false, observer) {
        if (isDone) {
            logger_1.default.log('Folder cleaned');
            this.getFilesReadyToUpload();
            return;
        }
        let $this = this;
        let call = () => {
            return this.getContentFolder()
                .flatMap(this.deleteContentFolder.bind(this));
        };
        let state$ = call();
        let sub = state$.subscribe(function (response) {
            if (!response || response.Deleted.length != 1000) {
                logger_1.default.log('Looks like we done here');
                $this.emptyFolder(true);
            }
            else {
                logger_1.default.log('Looks like we should continue to clean');
                $this.emptyFolder();
            }
            sub.dispose();
        });
    }
    getFilesReadyToUpload() {
        logger_1.default.log('Let\'s try to upload to ' + this.config.sourceFolder);
        return this.globRX(`${this.config.sourceFolder}/**/*.*`)
            .subscribe(this.uploadFiles.bind(this));
    }
    readFile(filePath) {
        return this.fs_readFile(filePath)
            .catch((err) => logger_1.default.error('[fs_readFile] error ', err));
    }
    upload(S3params) {
        return Rx.Observable.create((observer) => {
            this.S3_upload(S3params)
                .subscribe((response) => {
                logger_1.default.log(`Uploaded file: ${response.Bucket}/${response.Key}`);
                observer.onNext(true);
                observer.onCompleted();
            });
        });
    }
    uploadSingeFile(filePath, S3Params) {
        return this.fs_readFile(filePath)
            .map((fileData) => {
            S3Params.Body = fileData;
            return S3Params;
        }).flatMap(this.upload.bind(this));
    }
    uploadFiles(files) {
        let uploadStream = [...files.map((fPath) => {
                let S3fileName = fPath.replace(`${this.config.sourceFolder}/`, '');
                let S3Params = {
                    ACL: "public-read",
                    Bucket: this.config.S3Bucket,
                    Key: this.config.distFolder + S3fileName,
                    ContentType: mime.lookup(S3fileName)
                };
                if (S3fileName.indexOf('index.html') != -1) {
                    S3Params.CacheControl = 'no-store';
                }
                if (S3fileName.indexOf('robots.txt') != -1) {
                    S3Params.Key = `${this.config.distFolder}robots.txt`;
                }
                return this.uploadSingeFile(fPath, S3Params);
            })];
        let subsc = Rx.Observable.forkJoin(uploadStream);
        subsc.subscribe((results) => {
            logger_1.default.log('UPLOADED!!! ddd');
            this.observer.next('DONE');
        });
    }
    clearS3Cache(config) {
    }
    errorHandler(err) {
        console.error(err);
    }
}
exports.default = UploadToS3;
//# sourceMappingURL=uploadToS3.js.map