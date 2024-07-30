import { z } from 'zod';

export const addPresensi = z.object({
    idRfid: z.string().min(7).max(8),
})

export const addRegister = z.object({
    email: z.string().min(4).max(255),
    password: z.string().min(1).max(255),
})

export const addLogin = z.object({
    email: z.string().min(4).max(255),
    password: z.string().min(1).max(255),
})

export const addUser = z.object({
    email: z.string().min(1).max(100),
    nidn: z.string().min(10).max(10),
    name: z.string().min(1).max(100),
    jk: z.enum(['laki_laki', 'perempuan']),
    phone: z.string().min(10).max(16),
    alamat: z.string().min(10).max(100),
    idRfid: z.string().min(7).max(8),
})

export const patchUser = z.object({
    email: z.string().min(1).max(100).optional(),
    nidn: z.string().min(10).max(10).optional(),
    name: z.string().min(1).max(100).optional(),
    jk: z.enum(['laki_laki', 'perempuan']).optional(),
    phone: z.string().min(10).max(16).optional(),
    alamat: z.string().min(10).max(100).optional(),
    idRfid: z.string().min(7).max(8).optional(),
})