import { z } from 'zod';

export const addPresensi = z.object({
    idRfid: z.string().min(8).max(8),
})