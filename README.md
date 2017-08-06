# Easy way to deploy web app to S3/CF

Example for config JSON:
```
{
  "S3Bucket": "my-bucket-name-dev",
  "releaseVersion": null,
  "distFolder": null,
  "version": "version",
  "sourceFolder": "./dist",
  "region": "eu-west-1",
  "DistributionId": "E1ZKF9G******",
  "ItemsToInvalidate": [
    "/*",
    "/index.html",
    "/service-worker.js"
  ],
  "ApplicationName": "My-Cool-APP-NAME",
  "EnvironmentName": "Production" //
}
```

Command run:
`aws-fed-deployment --dpl-config path/to/my/config.json`

