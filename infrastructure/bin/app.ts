#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { TermoficarektStack } from "../lib/termoficarekt-stack";

const app = new cdk.App();
new TermoficarektStack(app, "TermoficarektStack", {
  envPrefix: app.node.tryGetContext("envPrefix") || "prod",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1", // S3 bucket region
  },
});
