# Easy way to deploy web app to S3/CF

This plugin dose two thing:
* Upload build ```./dist``` to S3 bucket.
* Invalidate CloudFront

Example for config JSON:
```
{
  "S3Bucket": "my-bucket-name-dev", // required
  "releaseVersion": null,
  "distFolder": null, // can be as folder
  "version": "version",
  "sourceFolder": "./dist", // required
  "region": "eu-west-1", // required
  "DistributionId": "E1ZKF9G******", // required
  "ItemsToInvalidate": [
    "/*",
    "/index.html",
    "/service-worker.js"
  ], // required
  "ApplicationName": "My-Cool-APP-NAME",
  "EnvironmentName": "Production" //
}
```

#### Important notes:
* Content in destination folder (or in bucket if 'distFolder' not provided) will be removed!!!
* S3 bucket and CF Distribution should to be in same region.

##Quick Start
1. Install package:
`npm install aws-fed-deployment --save-dev`
or
`yarn add aws-fed-deployment`

2. Command run:
`aws-fed-deployment --dpl-config <path/to/config/json>`


### Any feedback would be highly appreciated

