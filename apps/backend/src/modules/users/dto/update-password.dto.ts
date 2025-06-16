import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdatePasswordSchema = z.object({
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

export class UpdatePasswordDto extends createZodDto(UpdatePasswordSchema) {} 