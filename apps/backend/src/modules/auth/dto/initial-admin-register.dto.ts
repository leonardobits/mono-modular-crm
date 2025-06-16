import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsEnum } from 'class-validator';

export class InitialAdminRegisterDto {
  @ApiProperty({
    example: 'João da Silva',
    description: 'Nome completo do administrador inicial',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    example: 'admin@empresa.com',
    description: 'E-mail para registro do administrador inicial',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'Tipo de função do usuário',
    enum: ['ADMIN', 'MANAGER', 'AGENT'],
  })
  @IsEnum(['ADMIN', 'MANAGER', 'AGENT'])
  @IsNotEmpty()
  role: 'ADMIN' | 'MANAGER' | 'AGENT';

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Senha para o administrador inicial (mínimo 6 caracteres)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
} 