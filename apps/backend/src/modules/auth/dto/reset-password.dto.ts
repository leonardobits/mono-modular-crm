import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'usuario@empresa.com',
    description: 'E-mail do usuário para reset de senha',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
