import { DeleteResult, FindOptionsSelect, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import * as bcryptjs from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { USER_ENTITY_WITH_PASSWORD, UserDto, UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async createOne(dto: UserDto, userLanguage: string): Promise<UserEntity> {
    const { phoneNumber, email, password } = dto;

    const user: UserEntity | null = await this.usersRepository.findOne({
      where: [{ email }, { phoneNumber }],
    });

    if (user) {
      throw new HttpException('User already exist', HttpStatus.BAD_REQUEST);
    }

    const salt: string = bcryptjs.genSaltSync(10);
    const encodedPassword: string = bcryptjs.hashSync(password, salt);

    const newUser: UserEntity = this.usersRepository.create({
      ...dto,
      lang: userLanguage,
      password: encodedPassword,
    });
    return await this.usersRepository.save(newUser);
  }

  async findOne(id: string): Promise<UserEntity> {
    const user: UserEntity | null = await this.usersRepository.findOne({
      where: { id: id },
      select: USER_ENTITY_WITH_PASSWORD as FindOptionsSelect<UserEntity>,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return plainToInstance(UserEntity, user);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user: UserEntity | null = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return plainToInstance(UserEntity, user);
  }

  async findByRefreshToken(refreshToken: string): Promise<UserEntity> {
    const user: UserEntity | null = await this.usersRepository.findOne({
      where: { refreshToken: refreshToken },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return plainToInstance(UserEntity, user);
  }

  async updateOne(id: string, dto: Partial<UserDto>): Promise<UserEntity> {
    const userEntity: UserEntity | null = await this.usersRepository.findOne({
      where: { id },
      select: USER_ENTITY_WITH_PASSWORD as FindOptionsSelect<UserEntity>,
    });

    if (!userEntity) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.usersRepository.save({ ...userEntity, ...dto });
    } catch (_) {
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeOne(id: string): Promise<DeleteResult> {
    const userEntity: UserEntity | null = await this.usersRepository.findOne({
      where: { id },
    });

    if (!userEntity) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.usersRepository.delete(id);
    } catch (_) {
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
