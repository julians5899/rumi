import type { Config } from 'jest';
import baseConfig from '../../jest.config.base';

const config: Config = {
  ...baseConfig,
  displayName: 'api',
  moduleNameMapper: {
    '^@rumi/shared$': '<rootDir>/../shared/src',
    '^@rumi/db$': '<rootDir>/../db/src',
  },
};

export default config;
