import { Request, Response } from "express"
import prisma from "./prisma";
import { WhatsAppClient } from './whatsapp';
import { Presensi, Status, User } from "@prisma/client";
import { PresensiWithUser, PresensiData } from "./interface";

const whatsappClient = new WhatsAppClient();

export default class Controller {
    constructor() { }

    async index(request: Request, response: Response) {
        try {
            await whatsappClient.sendMessage('6283897916745', 'Hello World FROM Aditya')
            return response.status(200).json({ message: 'Hello World' });
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
            const idRfid: string = request.body
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
            if (!createdPresensi) response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
            return response.status(200).json({ status: 200, message: 'Berhasil get data presensi', data: {} });
        } catch (error: any) {
            return response.status(500).json({ status: 500, message: 'Terjadi kesalahan pada server' });
        }
    }

}
