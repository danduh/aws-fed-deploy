# Easy way to deploy web app to S3/CF


Example for config JSON:
```
{
  "S3Bucket": "my-bucket-name-dev", // required
  "releaseVersion": null,
  "distFolder": null,
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

Command run:
`aws-fed-deployment --dpl-config path/to/my/config.json`

