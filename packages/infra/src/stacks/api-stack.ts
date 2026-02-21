import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as logs from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  database: rds.IDatabaseInstance;
  databaseSecret: rds.DatabaseSecret;
  userPool: cognito.IUserPool;
  userPoolClient: cognito.IUserPoolClient;
  imagesBucket: s3.IBucket;
}

export class ApiStack extends cdk.Stack {
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Security group for Lambda
    const lambdaSg = new ec2.SecurityGroup(this, 'LambdaSg', {
      vpc: props.vpc,
      description: 'Security group for Rumi API Lambda',
    });

    // Allow Lambda → RDS connectivity
    props.database.connections.allowFrom(lambdaSg, ec2.Port.tcp(5432), 'Lambda to RDS');

    // Lambda function running the full Fastify app
    const apiFunction = new lambda.Function(this, 'RumiApiFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset('../api/dist', {
        // The dist folder is created by esbuild bundling
      }),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSg],
      environment: {
        NODE_ENV: 'production',
        DATABASE_URL: buildDatabaseUrl(props.databaseSecret, props.database),
        COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        COGNITO_CLIENT_ID: props.userPoolClient.userPoolClientId,
        AWS_COGNITO_REGION: this.region,
        S3_IMAGES_BUCKET: props.imagesBucket.bucketName,
      },
      logRetention: logs.RetentionDays.TWO_WEEKS,
    });

    // Grant Lambda access to the database secret
    props.databaseSecret.grantRead(apiFunction);

    // Grant Lambda access to the images bucket
    props.imagesBucket.grantReadWrite(apiFunction);

    // HTTP API Gateway v2
    this.httpApi = new apigwv2.HttpApi(this, 'RumiHttpApi', {
      apiName: 'rumi-api',
      corsPreflight: {
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ['*'], // Tighten in production
        maxAge: cdk.Duration.hours(1),
      },
    });

    // Proxy all routes to the Lambda function
    const lambdaIntegration = new apigwv2Integrations.HttpLambdaIntegration(
      'LambdaIntegration',
      apiFunction,
    );

    this.httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.httpApi.apiEndpoint,
      exportName: `${id}-endpoint`,
    });

    new cdk.CfnOutput(this, 'ApiFunctionName', {
      value: apiFunction.functionName,
      exportName: `${id}-function-name`,
    });
  }
}

/**
 * Build a DATABASE_URL from the secret and instance.
 * In production, you'd resolve this from Secrets Manager at runtime.
 * For the CDK, we pass the secret ARN and resolve in the Lambda.
 */
function buildDatabaseUrl(secret: rds.DatabaseSecret, instance: rds.IDatabaseInstance): string {
  // The Lambda will resolve the actual credentials from Secrets Manager at runtime.
  // This is a placeholder pattern — the actual implementation uses the secret ARN.
  return `SECRET_ARN:${secret.secretArn}:HOST:${instance.dbInstanceEndpointAddress}`;
}
