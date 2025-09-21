import * as z from 'zod';

export const serviceSchema = z.object({
  uuid: z.uuidv7(),
  name: z.string().min(2).max(100),
  status: z.enum(['running', 'idle']),
  path: z.string().min(2).max(200),
  proxy: z.url(),
  directory: z.string().min(2).max(200),
});

export type Service = z.infer<typeof serviceSchema>;
