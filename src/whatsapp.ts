import { Client, Message, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

export class WhatsAppClient {
    private client: Client;

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'] }
         });
        this.client.on('qr', (qr: string) => qrcode.generate(qr, { small: true }));
        this.client.on('ready', () => console.log('Client is ready!'));
        this.client.on('message', async (message: Message) => message.reply('Hello!'));
        this.client.initialize();
    }

    public async sendMessage(phone: string, message: string){
        try {
            const chatId = `${phone}@c.us`;
            const response = await this.client.sendMessage(chatId, message);
            return response;
        } catch (error: any) {
            throw new Error('Failed to send message: ' + error.message);
        }
    }
}
