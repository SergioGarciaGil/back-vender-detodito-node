const express = require('express');
const _ = require('underscore')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt')


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
        })
        res.status(201).send('Usuario creado exitosamente')
    })
})
module.exports = usuariosRouter