import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserDto, UserEntity } from './user.entity';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('create')
  async createOne(
    @Body() body: UserDto,
    @Req() req: Request,
  ): Promise<boolean> {
    const userLanguage = req.headers['x-user-language'] as string;
    await this.usersService.createOne(body, userLanguage);
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() body: UserDto,
  ): Promise<UserEntity> {
    return await this.usersService.updateOne(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeOne(@Param('id') id: string): Promise<boolean> {
    await this.usersService.removeOne(id);
    return true;
  }
}
