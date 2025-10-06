import { ApiConfig } from './app.config';

export default {
  host: ApiConfig.REDIS_HOST || 'redis',
  port: ApiConfig.REDIS_PORT || 6379,
};

export const REDIS_CLIENT = 'REDIS_CLIENT';
