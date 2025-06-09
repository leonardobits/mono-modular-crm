import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'O e-mail de acesso do usuário.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'A senha de acesso do usuário (mínimo 6 caracteres).',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
} 