import { registerAs } from '@nestjs/config';
import { seconds, ThrottlerModuleOptions } from '@nestjs/throttler';

import { ApiConfig } from './app.config';

export default registerAs('throttler', () => {
  const config = [
    {
      ttl: seconds(ApiConfig.THROTTLER_TTL),
      limit: ApiConfig.THROTTLER_LIMIT,
    },
  ] as const satisfies ThrottlerModuleOptions;
  return config;
});
