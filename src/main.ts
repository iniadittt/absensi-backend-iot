import express, { Application } from 'express';
import { environment } from './environment';
import bodyParser from 'body-parser';
import router from './router';
import qrcode from 'qrcode';
import { WhatsAppClient } from './whatsapp';

const app: Application = express(); 
const PORT: number = environment.port
const whatsappClient = new WhatsAppClient();

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(router);

app.get('/qr', async (req, res) => {
    try {
        const qr = whatsappClient.getQrCode();
        if (!qr) {
            res.status(400).send('QR Code not available yet');
            return;
        }
        const qrImageUrl = await qrcode.toDataURL(qr);
        res.send(`<img src="${qrImageUrl}" />`);
    } catch (error) {
        res.status(500).send('Error generating QR code');
    }
});

app.listen(PORT, () => console.log(`[SERVER] running on port ${PORT}`));
