import { createZodDto } from 'nestjs-zod';
import { updateUserSchema as UpdateUserSchema } from 'zod-schemas';

export { UpdateUserSchema };
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
