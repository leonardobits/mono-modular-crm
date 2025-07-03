import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EvolutionWebhookDto {
  @ApiProperty({
    description: 'Tipo do evento do webhook',
    example: 'messages.upsert',
    enum: ['messages.upsert', 'connection.update', 'qrcode.updated'],
  })
  @IsString()
  event: string;

  @ApiProperty({
    description: 'Nome da instância do Evolution API',
    example: 'instance1',
  })
  @IsString()
  instance: string;

  @ApiProperty({
    description: 'Dados do webhook',
    example: {
      key: {
        remoteJid: '5511999999999@s.whatsapp.net',
        fromMe: false,
        id: 'message-id',
      },
      message: {
        conversation: 'Olá, preciso de ajuda',
      },
      pushName: 'João Silva',
      messageTimestamp: 1640995200,
    },
  })
  @IsObject()
  data: any;

  @ApiProperty({
    description: 'Token de autenticação do webhook',
    example: 'webhook-secret-token',
    required: false,
  })
  @IsOptional()
  @IsString()
  token?: string;
}