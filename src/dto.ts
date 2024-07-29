import { z } from 'zod';

export const addPresensi = z.object({
    idRfid: z.string().min(10).max(10),
})