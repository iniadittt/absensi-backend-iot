import { z } from 'zod';

export const addPresensi = z.object({
    idRfid: z.string().min(4).max(10),
})