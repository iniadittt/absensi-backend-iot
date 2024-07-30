import { Request, Response } from "express"
import prisma from "./prisma";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { WhatsAppClient } from './whatsapp';
import { Account, Jk, Presensi, Status, User } from "@prisma/client";
import { PresensiWithUser, PresensiData } from "./interface";
import { environment } from "./environment";

const whatsappClient = new WhatsAppClient();

export default class Controller {
    constructor() { }

    async deleteAllPresensi(request: Request, response: Response) {
        try {
            await prisma.presensi.deleteMany()
            return response.status(200).json({ status: 200, message: 'Berhasil menghapus semua presensi' });
        } catch (error) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

    async index(request: Request, response: Response) {
        try {
            await whatsappClient.sendMessage('6283897916745', 'Hello World FROM Aditya')
            return response.status(200).json({ message: 'Hello World' });
        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

    async postRegister(request: Request, response: Response) {
        try {
            const { email, password } = request.body
            const account: Account | null = await prisma.account.findUnique({ where: { email } });
            if (account) return response.status(400).json({ status: 400, message: 'Email sudah digunakan' });
            const hashPassword: string = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
            const createAccount: Account = await prisma.account.create({ data: { email, password: hashPassword } })
            if (!createAccount) return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
            return response.status(200).json({ status: 200, message: 'Registrasi berhasil' });
        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

    async postLogin(request: Request, response: Response) {
        try {
            const { email, password } = request.body
            const account: Account | null = await prisma.account.findUnique({ where: { email } });
            if (!account) return response.status(400).json({ status: 400, message: 'Email dan password salah' });
            if (account.password !== password) return response.status(400).json({ status: 400, message: 'Email dan password salah' });
            const token: string = jwt.sign({ id: account.id }, environment.jwt.secret, { expiresIn: '30d' });
            return response.status(200).json({ status: 200, message: 'Berhasil login', data: { token } });
        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

    async getPresensi(request: Request, response: Response) {
        try {
            const presensi: PresensiWithUser[] = await prisma.presensi.findMany({
                include: {
                    user: true
                }
            });
            if (presensi.length === 0) return response.status(404).json({ status: 404, message: 'Data presensi tidak ditemukan' });
            const data: PresensiData[] = presensi.map((item: PresensiWithUser) => {
                const { user, ...values } = item;
                return { id: values.id, time: values.time, status: values.status, name: user.name };
            });
            return response.status(200).json({ status: 200, message: 'Berhasil get data presensi', data: { presensi: data } });
        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

    async postPresensi(request: Request, response: Response) {
        try {
            const idRfid: string = request.body.idRfid
            const user: User | null = await prisma.user.findUnique({ where: { idRfid } })
            if (!user) return response.status(400).json({ status: 400, message: 'RFID tidak terdaftar' });
            const todayUTC: Date = new Date();
            const currentUTCOffsetInMilliseconds = todayUTC.getTimezoneOffset() * 60 * 1000;
            const utcPlus7OffsetInMilliseconds = 7 * 60 * 60 * 1000;
            const todayInUTCPlus7: Date = new Date(todayUTC.getTime() + currentUTCOffsetInMilliseconds + utcPlus7OffsetInMilliseconds);
            const startOfDay = new Date(todayInUTCPlus7.getFullYear(), todayInUTCPlus7.getMonth(), todayInUTCPlus7.getDate(), 0, 0, 0, 0)
            const endOfDay = new Date(todayInUTCPlus7.getFullYear(), todayInUTCPlus7.getMonth(), todayInUTCPlus7.getDate(), 23, 59, 59, 999)
            const presensi: Presensi[] | [] = await prisma.presensi.findMany({
                where: {
                    idRfid: user.idRfid,
                    time: {
                        gte: startOfDay,
                        lt: endOfDay
                    }
                }
            });
            if (presensi.length >= 2) return response.status(400).json({ status: 400, message: 'User sudah melakukan presensi hari ini' });
            const status = presensi.length === 0 ? Status.masuk : Status.keluar
            const createdPresensi: Presensi = await prisma.presensi.create({
                data: {
                    idRfid: user.idRfid,
                    time: todayInUTCPlus7,
                    status,
                }
            });
            if (!createdPresensi) return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
            await whatsappClient.sendMessage(user.phone, `${user.name}, anda berhasil melakukan presensi ${status}, pukul: ${todayInUTCPlus7.toLocaleTimeString('id-ID')} WIB`);
            return response.status(200).json({ status: 200, message: 'Berhasil melakukan presensi' });
        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

    async getUsers(request: Request, response: Response) {
        try {
            const users: User[] = await prisma.user.findMany();
            if (users.length === 0) return response.status(404).json({ status: 404, message: 'Data user tidak ditemukan' });
            return response.status(200).json({ status: 200, message: 'Berhasil get data user', data: { users } });
        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

    async getUser(request: Request, response: Response) {
        try {
            const id: number = parseInt(request.params.id);
            if (isNaN(id)) return response.status(400).json({ status: 400, message: 'ID harus berupa angka' })
            const user: User | null = await prisma.user.findUnique({ where: { id } });
            if (!user) return response.status(404).json({ status: 404, message: 'Data user tidak ditemukan' });
            return response.status(200).json({ status: 200, message: 'Berhasil get data user', data: { user } });
        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

    async postUser(request: Request, response: Response) {
        try {
            const checkEmail: User | null = await prisma.user.findFirst({ where: { email: request.body.email } });
            if (checkEmail) return response.status(404).json({ status: 404, message: 'Email sudah digunakan' });
            const checkNidn: User | null = await prisma.user.findFirst({ where: { nidn: request.body.nidn } });
            if (checkNidn) return response.status(404).json({ status: 404, message: 'NIDN sudah digunakan' });
            const checkIdRfid: User | null = await prisma.user.findFirst({ where: { idRfid: request.body.idRfid } });
            if (checkIdRfid) return response.status(404).json({ status: 404, message: 'ID Rfid sudah digunakan' });
            const createdUser: User | null = await prisma.user.create({
                data: {
                    email: request.body.email,
                    nidn: request.body.nidn,
                    name: request.body.name,
                    jk: request.body.jk ? Jk.laki_laki : Jk.perempuan,
                    phone: request.body.phone,
                    alamat: request.body.alamat,
                    idRfid: request.body.idRfid,
                }
            })
            if (!createdUser) return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
            return response.status(200).json({ status: 200, message: 'Berhasil tambah data user' });
        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

    async patchUser(request: Request, response: Response) {
        try {
            const id: number = parseInt(request.params.id);
            if (isNaN(id)) return response.status(400).json({ status: 400, message: 'ID harus berupa angka' })
            const user: User | null = await prisma.user.findUnique({ where: { id } });
            if (!user) return response.status(400).json({ status: 400, message: 'Data user tidak ada' });
        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

    async deleteUser(request: Request, response: Response) {
        try {

        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }
}
