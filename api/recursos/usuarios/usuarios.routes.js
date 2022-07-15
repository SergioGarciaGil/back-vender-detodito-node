const express = require('express');
const _ = require('underscore')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const log = require('../../../utils/logger');
const validarUsuario = require('./usuarios.validate')
const usuarios = require('../../../dataBase').usuarios

const usuariosRouter = express.Router();

usuariosRouter.get('/', (req, res) => {
    res.json(usuarios);
})

usuariosRouter.post('/', validarUsuario, (req, res) => {
    let nuevoUsurio = req.body;

    let indice = _.findIndex(usuarios, usuario => {
        return usuario.username === nuevoUsurio.username || usuario.email === nuevoUsurio.email
    })
    if (indice !== -1) {
        log.info('Email o username ya existen en nuestra cuenta asociada')
        //409 conflict
        res.status(409).send('El email o username ya esatan asociados a una cuenta')
        return
    }
    // No se puede revertir el hash
    bcrypt.hash(nuevoUsurio.password, 10, (err, hashedPassword) => {
        if (err) {
            log.error('Error ocurrió al tratar de obtner el hash de la contraseña', err)
            res.status(500).send('Ocurrió un error procesando creación del usuario')
            return
        }
        usuarios.push({
            username: nuevoUsurio.username,
            email: nuevoUsurio.email,
            password: hashedPassword,
            id: uuidv4()
        })
        res.status(201).send('Usuario creado exitosamente')
    })
})
usuariosRouter.post('/login', (req, res) => {
    let usuarioNoAutenticado = req.body
    let index = _.findIndex(usuarios, usuario => usuario.username === usuarioNoAutenticado.username);
    // los usuarios no pueden ser procesados por que estamos protegiendo la ruta
    if (index === -1) {
        log.info(`Usuario ${usuarioNoAutenticado.username} No existe. No pudo ser autenticado`)
        res.status(400).send('Credenciales incorrectas el usuario no existe')
        return;
    }
    let hashedPassword = usuarios[index].password// obtenemos la contraseña hasheada y luego comparamos
    bcrypt.compare(usuarioNoAutenticado.password, hashedPassword, (err, iguales) => {
        if (iguales) {

            let token = jwt.sign({ id: usuarios[index].id }, 'esto es un secreto', {
                expiresIn: 86400
            })
            log.info(`Usuario ${usuarioNoAutenticado.username} completo la autentificación existosamente`)
            res.status(200).json({ token })


            return
        } else {
            log.info(`Usuario ${usuarioNoAutenticado.username} No completó la autenticacion. Contraseña Incorrecta`)
            res.status(400).send('Credenciales incorrectas. Asegurate que username y contraseña sean correctos')
        }
    })
})
module.exports = usuariosRouter