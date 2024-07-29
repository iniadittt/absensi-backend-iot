import express from 'express';
import Controller from './controller'
import validation from './validation';
import { addPresensi } from './dto';

const router = express.Router()
const controller: Controller = new Controller()

router.get('/', controller.index);
router.get('/presensi', controller.getPresensi);
router.post('/presensi', validation(addPresensi), controller.postPresensi);

export default router