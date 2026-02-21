import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

interface StorageStackProps extends cdk.StackProps {
  stage: string;
}

export class StorageStack extends cdk.Stack {
  public readonly imagesBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    // S3 bucket for property and profile images
    const imagesBucket = new s3.Bucket(this, 'RumiImagesBucket', {
      bucketName: `rumi-${props.stage}-images-${this.account}`,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
          allowedOrigins: ['*'], // Tighten in production
          maxAge: 3600,
        },
      ],
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: props.stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.stage !== 'prod',
      lifecycleRules: [
        {
          // Clean up incomplete multipart uploads
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
      ],
    });

    this.imagesBucket = imagesBucket;

    // Outputs
    new cdk.CfnOutput(this, 'ImagesBucketName', {
      value: imagesBucket.bucketName,
      exportName: `${id}-images-bucket`,
    });

    new cdk.CfnOutput(this, 'ImagesBucketArn', {
      value: imagesBucket.bucketArn,
      exportName: `${id}-images-bucket-arn`,
    });
  }
}
