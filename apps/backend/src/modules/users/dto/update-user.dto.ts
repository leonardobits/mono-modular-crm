import { createZodDto } from 'nestjs-zod';
import { updateUserSchema } from 'zod-schemas';

export class UpdateUserDto extends createZodDto(updateUserSchema) {} 