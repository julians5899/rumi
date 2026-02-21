import awsLambdaFastify from '@fastify/aws-lambda';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { buildApp } from './app';

let proxy: ReturnType<typeof awsLambdaFastify>;

export const handler = async (event: APIGatewayProxyEventV2, context: Context) => {
  if (!proxy) {
    const app = await buildApp();
    proxy = awsLambdaFastify(app);
  }
  return proxy(event, context, () => {});
};
