import { Body, Controller, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ConfirmPasswordResetDto,
  GoogleLoginDto,
  LoginBodyDto,
  PasswordResetRequestDto,
} from './auth.dto';
import { UserEntity } from '../users/user.entity';
import { AuthService } from './auth.service';
import { PasswordResetService } from '../../services/password-reset.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly resetPasswordService: PasswordResetService,
  ) {}

  @Post('login')
  async login(
    @Body() body: LoginBodyDto,
    @Res() res: Response,
  ) {
    const user: UserEntity = await this.authService.validateUser(
      body.email,
      body.password,
    );

    const { access_token } = await this.authService.login(user, res);
    res.json({ access_token });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const { access_token } = await this.authService.refreshTokens(req, res);
    res.json({ access_token });
  }

  @Post('logout/:id')
  async logout(@Param('id') id: string, @Res() res: Response): Promise<void> {
    res.json({ logout: await this.authService.logout(id, res) });
  }

  @Post('google-auth')
  async googleAuth(
    @Body() { idToken }: GoogleLoginDto,
    @Res() res: Response,
  ): Promise<void> {
    const access_token = await this.authService.handleGoogleLogin(
      idToken,
      res,
    );
    res.json(access_token);
  }

  @Post('reset-password/request')
  async resetPassword(
    @Body() { email }: PasswordResetRequestDto,
  ): Promise<void> {
    await this.resetPasswordService.requestPasswordReset(email);
  }

  @Post('reset-password/confirm')
  async confirmPasswordReset(
    @Body() { token, newPassword }: ConfirmPasswordResetDto,
  ): Promise<void> {
    await this.resetPasswordService.confirmPasswordReset(token, newPassword);
  }
}
