import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'O nome completo do novo usuário.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'new.user@email.com',
    description: 'O e-mail para registro do novo usuário.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'A senha para registro do novo usuário (mínimo 6 caracteres).',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'O token de verificação do CAPTCHA fornecido pelo frontend.',
    example: 'token_gerado_pelo_captcha_widget',
  })
  @IsString()
  @IsNotEmpty()
  captchaToken: string;
}
