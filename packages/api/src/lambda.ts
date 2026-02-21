import awsLambdaFastify from '@fastify/aws-lambda';
import { buildApp } from './app';

let proxy: ReturnType<typeof awsLambdaFastify>;

export const handler = async (event: unknown, context: unknown) => {
  if (!proxy) {
    const app = await buildApp();
    proxy = awsLambdaFastify(app);
  }
  return proxy(event, context);
};
