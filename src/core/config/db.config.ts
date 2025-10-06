import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ApiConfig } from './app.config';

export default registerAs('db', () => {
  const config = {
    type: 'postgres',
    url: ApiConfig.DB_URL,
    autoLoadEntities: true,
  } as const satisfies TypeOrmModuleOptions;
  return config;
});
