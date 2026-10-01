// src/modules/__context__/features/__feature__/__feature__.dto.ts
// Validation happens here, once. Everything downstream trusts these types.
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const __Feature__Schema = z.object({
  // field: z.string().uuid(),
});
export class __Feature__Dto extends createZodDto(__Feature__Schema) {}

export const __Feature__ResponseSchema = z.object({
  // id: z.string(),
});
export class __Feature__ResponseDto extends createZodDto(__Feature__ResponseSchema) {}

// Route params: define a separate schema/DTO (e.g. __Feature__ParamsDto) and use @Param().
