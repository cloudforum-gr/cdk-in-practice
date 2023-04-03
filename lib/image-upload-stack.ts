import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Notifications from "aws-cdk-lib/aws-s3-notifications";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as lambdaSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class ImageUploadStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "ImageUploadBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
    });
    const queue = new sqs.Queue(this, "ImageUploadEventQueue", {
      visibilityTimeout: Duration.minutes(2),
    });
    const s3ImageHandler = new lambda.NodejsFunction(
      this,
      "S3ImageUploadHandlerFunction",
      {
        description: "My lambda function v3",
        entry: `${path.resolve(
          __dirname,
          "handlers/s3-image-upload-handler.ts"
        )}`,
        runtime: Runtime.NODEJS_18_X,
        bundling: {
          nodeModules: ["sharp"],
          forceDockerBundling: true,
        },
      }
    );
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.SqsDestination(queue),
      {
        prefix: "uploads/",
      }
    );
    s3ImageHandler.addEventSource(new lambdaSources.SqsEventSource(queue));
    bucket.grantReadWrite(s3ImageHandler);
  }
}
