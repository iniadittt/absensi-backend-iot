import express from 'express';
import Controller from './controller'
import validation from './validation';
import authentication from './authentication';
import { addPresensi, addUser, patchUser, addRegister, addLogin } from './dto';

const router = express.Router()
const controller: Controller = new Controller()

router
    .get('/', controller.index)
    .post('/register', validation(addRegister), controller.postRegister)
    .post('/login', validation(addLogin), controller.postLogin)
    .get('/delete-all-presensi', controller.deleteAllPresensi)
    .post('/presensi', validation(addPresensi), controller.postPresensi)
    .get('/presensi', authentication, controller.getPresensi)
    .get('/users', authentication, controller.getUsers)
    .get('/users/:id', authentication, controller.getUser)
    .post('/users', authentication, validation(addUser), controller.postUser)
    .patch('/users/:id', authentication, validation(patchUser), controller.patchUser)
    .delete('/users/:id', authentication, controller.deleteUser)
    .get('/dosen', controller.dosen)
    .get('/dashboard',authentication, controller.dashboard)

export default router