import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInboxDto {
  @ApiProperty({
    description: 'Nome da caixa de entrada',
    example: 'Atendimento Website',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID do canal de comunicação',
    example: 'uuid-channel-id',
  })
  @IsUUID()
  channel_id: string;

  @ApiProperty({
    description: 'Configurações específicas da caixa de entrada em formato JSON',
    example: { webhook_url: 'https://api.example.com/webhook' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}