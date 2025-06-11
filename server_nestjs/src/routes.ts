import { Routes } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

export const apiRoutes: Routes = [
  {
    path: '/api/auth',
    module: AuthModule,
  },
  {
    path: '/api/users',
    module: UsersModule,
  },
];
