import { Client, Message, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';

export class WhatsAppClient {
    private client: Client;
    private qrCode: string | null = null;

    constructor() {
        this.client = new Client({ authStrategy: new LocalAuth() });

        this.client.on('qr', async (qr: string) => {
            this.qrCode = qr;
            try {
                const qrImageUrl = await qrcode.toDataURL(qr);
                console.log('QR Code URL:', qrImageUrl);
            } catch (error) {
                console.error('Failed to generate QR Code URL:', error);
            }
        });

        this.client.on('ready', () => console.log('Client is ready!'));
        this.client.on('message', async (message: Message) => {
            console.log({ message })
            message.reply('Hello!')
        });
        this.client.initialize();
    }

    public async sendMessage(phone: string, message: string) {
        try {
            const chatId = `${phone}@c.us`;
            const response = await this.client.sendMessage(chatId, message);
            return response;
        } catch (error: any) {
            throw new Error('Failed to send message: ' + error.message);
        }
    }

    // Method to get the QR code
    public getQrCode(): string | null {
        return this.qrCode;
    }
}
