import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { env } from './env';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: env.NODE_ENV !== 'production',
  logging: env.NODE_ENV === 'development',
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}; 