import { createZodDto } from 'nestjs-zod';
import { createUserSchema } from 'zod-schemas';

export class CreateUserDto extends createZodDto(createUserSchema) {} 