import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function typeormFactory(configService: ConfigService) {
  return Promise.resolve({
    type: configService.get('DATABASE_TYPE'),
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USERNAME'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    synchronize: configService.get('DATABASE_SYNC'),
    autoLoadEntities: true,
  }) as Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
}
