import { IsString, IsUUID, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInboxDto {
  @ApiProperty({
    description: 'Nome da caixa de entrada',
    example: 'Atendimento Website Atualizado',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'ID do canal de comunicação',
    example: 'uuid-channel-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  channel_id?: string;

  @ApiProperty({
    description: 'Configurações específicas da caixa de entrada em formato JSON',
    example: { webhook_url: 'https://api.example.com/webhook' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiProperty({
    description: 'Status ativo/inativo da caixa de entrada',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}