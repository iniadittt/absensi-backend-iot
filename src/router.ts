import express from 'express';
import Controller from './controller'
import validation from './validation';
import { addPresensi } from './dto';

const router = express.Router()
const controller: Controller = new Controller()

router
    .get('/', controller.index)
    .post('/register', controller.postRegister)
    .post('/login', controller.postLogin)
    .get('/presensi', controller.getPresensi)
    .post('/presensi', validation(addPresensi), controller.postPresensi)
    .get('/users', controller.getUsers)
    .get('/users/:id', controller.getUser)
    .post('/users', controller.postUser)
    .patch('/users/:id', controller.patchUser)
    .delete('/users/:id', controller.deleteUser)

export default router