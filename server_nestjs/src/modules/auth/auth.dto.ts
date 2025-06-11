export class LoginBodyDto {
  email: string;
  password: string;
}

export class GoogleLoginDto {
  idToken: string;
}

export class PasswordResetRequestDto {
  email: string;
}

export class ConfirmPasswordResetDto {
  token: string;
  newPassword: string;
}
