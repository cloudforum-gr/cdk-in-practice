#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { UserImageProfileStack } from "../lib/user-image-profile-stack";

const app = new cdk.App();
new UserImageProfileStack(app, "UserImageProfileStack", {
  env: {
    region: "us-east-2",
    account: process.env.AWS_ACCOUNT_ID,
  },
});
