import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import type { Construct } from 'constructs';

interface FrontendStackProps extends cdk.StackProps {
  apiGateway: apigwv2.HttpApi;
}

export class FrontendStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // S3 bucket for the React SPA
    const websiteBucket = new s3.Bucket(this, 'RumiWebsiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Origin Access Identity for CloudFront → S3
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'RumiOAI',
      { comment: 'OAI for Rumi frontend' },
    );

    websiteBucket.grantRead(originAccessIdentity);

    // Extract the API domain from the endpoint URL
    const apiDomainName = cdk.Fn.select(
      2,
      cdk.Fn.split('/', props.apiGateway.apiEndpoint),
    );

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'RumiDistribution', {
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        // Proxy /api/* to the API Gateway
        '/api/*': {
          origin: new cloudfrontOrigins.HttpOrigin(apiDomainName, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      // SPA: redirect all 404s to index.html
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // Deploy the built frontend to S3
    new s3deploy.BucketDeployment(this, 'RumiWebsiteDeploy', {
      sources: [s3deploy.Source.asset('../web/dist')],
      destinationBucket: websiteBucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      exportName: `${id}-domain`,
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      exportName: `${id}-distribution-id`,
    });

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      exportName: `${id}-url`,
    });
  }
}
