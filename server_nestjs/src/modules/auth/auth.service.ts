import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async validateUser(email: string, pass: string): Promise<UserEntity> {
    const user: UserEntity = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result as UserEntity;
    }

    throw new HttpException(
      'Validation failed. Invalid credentials',
      HttpStatus.UNAUTHORIZED,
    );
  }

  async login(
    user: UserEntity,
    res: Response,
  ): Promise<{ access_token: string }> {
    const payload = { sub: user.id, email: user.email };
    const access_token: string = this.jwtService.sign(payload);
    const refresh_token: string = this.generateRefreshToken(user.id);

    const userEntity: UserEntity = await this.usersService.findOne(user.id);

    if (!userEntity) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    await this.usersService.updateOne(user.id, {
      refreshToken: refresh_token,
    });

    this.setCookies(res, refresh_token);
    return { access_token };
  }

  async refreshTokens(
    req: Request,
    res: Response,
  ): Promise<{ access_token: string }> {
    const refreshToken: string | undefined = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new HttpException('Refresh token missing', HttpStatus.UNAUTHORIZED);
    }

    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new HttpException(
        'Refresh token expired or invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { id, email } =
      await this.usersService.findByRefreshToken(refreshToken);

    const access_token: string = this.jwtService.sign({
      sub: id,
      email: email,
    });
    const refresh_token: string = this.generateRefreshToken(id);

    await this.usersService.updateOne(id, {
      refreshToken: refresh_token,
    });

    this.setCookies(res, refresh_token);
    return { access_token };
  }

  async logout(id: string, res: Response): Promise<boolean> {
    const { refreshToken } = await this.usersService.updateOne(id, {
      refreshToken: '',
    });
    this.clearCookies(res);

    return refreshToken === '';
  }

  async handleGoogleLogin(
    idToken: string,
    res: Response,
  ): Promise<{ access_token: string }> {
    const ticket: LoginTicket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.configService.get('GOOGLE_CLIENT_ID'),
    });

    const payload: TokenPayload | undefined = ticket.getPayload();

    if (!payload) {
      throw new HttpException(
        'Invalid Google credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { sub, email, email_verified } = payload;

    if (!email || !sub || !email_verified) {
      throw new HttpException(
        'Invalid Google credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    let user: UserEntity = await this.usersService.findByEmail(email);
    let shouldUpdate: boolean = false;

    if (!user.googleId) {
      user.googleId = sub;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await this.usersService.updateOne(user.id, user);
    }

    return this.login(user, res);
  }

  private generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN_DAYS',
        ),
        // expiresIn: '1m', // For tests
      },
    );
  }

  private setCookies(res: Response, refresh_token: string): void {
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: this.configService.get<boolean>('COOKIE_REFRESH_TOKEN_SECURE'),
      sameSite: this.configService.get<'lax' | 'strict' | 'none'>(
        'COOKIE_REFRESH_TOKEN_SAME_SITE',
      ),
      path: this.configService.get<string>('COOKIE_REFRESH_TOKEN_PATH'),
      maxAge:
        +(
          this.configService.get<string>('COOKIE_REFRESH_TOKEN_MAX_AGE') ?? '7'
        ) *
        24 *
        60 *
        60 *
        1000,
      // maxAge: 60 * 1000, // 1 minute for tests as the refresh token expires in 1 minute
    });
  }

  private clearCookies(res: Response): void {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.configService.get<boolean>('COOKIE_REFRESH_TOKEN_SECURE'),
      sameSite: this.configService.get<'lax' | 'strict' | 'none'>(
        'COOKIE_REFRESH_TOKEN_SAME_SITE',
      ),
      path: this.configService.get<string>('COOKIE_REFRESH_TOKEN_PATH'),
    });
  }
}
