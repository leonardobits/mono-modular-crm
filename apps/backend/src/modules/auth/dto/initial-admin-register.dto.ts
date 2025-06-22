import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class InitialAdminRegisterDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do administrador inicial',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'admin@empresa.com',
    description: 'E-mail para registro do administrador inicial',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Senha para o administrador inicial (mínimo 8 caracteres)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'F',
    description: 'Tipo de pessoa: F (Física) ou J (Jurídica)',
  })
  @IsString()
  @IsNotEmpty()
  tipoPessoa: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Data de nascimento',
  })
  @IsDateString()
  @IsNotEmpty()
  dataNascimento: string;

  @ApiProperty({
    example: '123.456.789-10',
    description: 'CPF ou CNPJ',
  })
  @IsString()
  @IsNotEmpty()
  cpfCnpj: string;

  @ApiProperty({
    example: '12345-678',
    description: 'CEP do endereço',
  })
  @IsString()
  @IsNotEmpty()
  cep: string;

  @ApiProperty({
    example: 'São Paulo',
    description: 'Cidade',
  })
  @IsString()
  @IsNotEmpty()
  cidade: string;

  @ApiProperty({
    example: 'SP',
    description: 'Estado (UF)',
  })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiProperty({
    example: 'Rua das Flores',
    description: 'Endereço',
  })
  @IsString()
  @IsNotEmpty()
  endereco: string;

  @ApiProperty({
    example: '123',
    description: 'Número do endereço',
  })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({
    example: 'Apt 101',
    description: 'Complemento do endereço',
    required: false,
  })
  @IsString()
  @IsOptional()
  complemento?: string;

  @ApiProperty({
    description: 'Token do hCaptcha para verificação',
    required: false,
  })
  @IsString()
  @IsOptional()
  captchaToken?: string;
}
