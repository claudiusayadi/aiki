import { DataSource } from 'typeorm';
import { ApiConfig } from './app.config';

export default new DataSource({
  type: 'postgres',
  url: ApiConfig.DB_URL,
  entities: ['dist/src/modules/**/*.entity.js'],
  migrations: ['dist/src/modules/db/migrations/*.js'],
});
