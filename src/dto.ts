import { z } from 'zod';

export const addPresensi = z.object({
    idRfid: z.string().min(7).max(8),
})