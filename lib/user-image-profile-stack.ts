import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { SqsDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { ImageProcessingFunction } from "./constructs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class UserImageProfileStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "UserImageBucket", {
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      eventBridgeEnabled: true,
    });
    const queue = new Queue(this, "UserImageUploadQueue", {
      visibilityTimeout: Duration.minutes(2),
    });
    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new SqsDestination(queue),
      {
        prefix: "uploads/",
      }
    );
    const handler = new ImageProcessingFunction(
      this,
      "ImageProcessingFunction",
      {
        entry: "s3-image-upload-handler.ts",
      }
    );
    handler.addEventSource(new SqsEventSource(queue));
    bucket.grantReadWrite(handler);
  }
}
