import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

interface TermoficarektStackProps extends cdk.StackProps {
  envPrefix: string;
}

export class TermoficarektStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TermoficarektStackProps) {
    super(scope, id, props);

    // S3 bucket for website content (private, CloudFront only)
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      bucketName: `${props.envPrefix}-termoficarekt-website-1`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Origin Access Control for CloudFront
    const oac = new cloudfront.S3OriginAccessControl(this, "OAC", {
      originAccessControlName: `${props.envPrefix}-termoficarekt-oac`,
      description: "OAC for termoficarekt website",
    });

    // Import existing hosted zone for termoficarekt.com
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: "termoficarekt.com",
    });

    // SSL certificate (must be in us-east-1 for CloudFront)
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: "termoficarekt.com",
      subjectAlternativeNames: ["www.termoficarekt.com"],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: ["termoficarekt.com", "www.termoficarekt.com"],
      certificate: certificate,
      defaultRootObject: "index.html",
    });

    // Route53 records
    new route53.ARecord(this, "ARecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
    });

    new route53.ARecord(this, "WWWARecord", {
      zone: hostedZone,
      recordName: "www",
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
    });
  }
}
