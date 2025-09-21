import { serviceSchema } from '~~/shared/types/service';
import * as z from 'zod';

export const serviceDrawerStateSchema = z.object({
  open: z.boolean(),
  operation: z.enum(['insert', 'update']),
  service: z.optional(serviceSchema),
});

export type ServiceDrawerState = z.infer<typeof serviceDrawerStateSchema>;
