import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { UserEntity } from '../modules/users/user.entity';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    const user: UserEntity = await this.usersService.findByEmail(email);

    if (!user) {
      return;
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };
    const token: string = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_PASSWORD_RESET_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_PASSWORD_RESET_EXPIRES_IN_MIN',
      ),
    });

    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(
      Date.now() +
        +(
          this.configService.get<string>('JWT_PASSWORD_RESET_EXPIRES_IN') ??
          '15'
        ) *
          60 *
          1000,
    );
    await this.usersService.updateOne(user.id, user);

    const resetLink: string = `${this.configService.get<string>('CLIENT_CORS_ORIGIN')}/reset-password?token=${token}`;

    // TODO This is primarily 2 languages for now UA ans EN
    // TODO Ideally in future there would be need to create own language table in DB to handle more languages
    // TODO Check for NestJS i18n module!!!!!!!!!!
    await this.mailerService.sendMail({
      to: user.email,

      // TODO For now only UA language is supported
      subject: 'Запит на відновлення паролю',
      template: `ua/reset-password`,

      // subject:
      //   user.lang === 'ua'
      //     ? 'Запит на відновлення паролю'
      //     : 'Password reset request',
      // template:
      //   user.lang === 'ua'
      //     ? `${user.lang}/reset-password`
      //     : `${user.lang}/reset-password`, // See TODO's
      context: {
        name: user.fullName || user.email,
        resetLink,
      },
    });
  }

  async confirmPasswordReset(token: string, password: any): Promise<void> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_PASSWORD_RESET_SECRET'),
      });

      const salt: string = bcryptjs.genSaltSync(10);
      const encodedPassword: string = bcryptjs.hashSync(password, salt);

      const user: UserEntity = await this.usersService.findOne(payload.sub);

      if (
        !user.passwordResetToken ||
        user.passwordResetToken !== token ||
        !user.passwordResetExpires ||
        user.passwordResetExpires < new Date()
      ) {
        throw new HttpException(
          'Invalid or expired token',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedUser = {
        ...user,
        password: encodedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      };
      await this.usersService.updateOne(user.id, updatedUser);
    } catch (err) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
