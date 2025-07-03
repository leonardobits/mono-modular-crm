import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignAgentDto {
  @ApiProperty({
    description: 'ID do usuário/agente a ser atribuído',
    example: 'uuid-user-id',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Papel do agente na caixa de entrada',
    example: 'AGENT',
    enum: ['AGENT', 'MANAGER', 'ADMIN'],
    required: false,
    default: 'AGENT',
  })
  @IsOptional()
  @IsString()
  role?: string;
}