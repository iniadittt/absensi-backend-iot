import express, { Application } from 'express';
import { environment } from './environment';
import bodyParser from 'body-parser';
import router from './router';

const app: Application = express(); 
const PORT: number = environment.port

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(router);

app.listen(PORT, () => console.log(`[SERVER] running on port ${PORT}`));
