import { Presensi, User } from "@prisma/client";

export interface PresensiData {
    id: number;
    time: Date;
    status: string;
    name: string;
}
export interface PresensiWithUser extends Presensi {
    user: User;
}