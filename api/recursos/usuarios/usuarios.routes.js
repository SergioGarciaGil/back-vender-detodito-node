const express = require('express');
const _ = require('underscore')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const log = require('../../../utils/logger');
const validarUsuario = require('./usuarios.validate').validarUsuario
const validarPedidoDeLogin = require('./usuarios.validate').validarPedidoDeLogin
const usuarios = require('../../../dataBase').usuarios
const config = require('./../../../config')
const usuarioController = require('./usuarios.controller')

const usuariosRouter = express.Router();

usuariosRouter.get('/', (req, res) => {
    usuariosController.obtenerUsuarios()
        .then(usuarios => {
            res.json(usuarios)
        })
        .catch(err => {
            log.error('Error al obtener todos los usuarios', err)
            res.sendStatus(500)
        })
})

usuariosRouter.post('/', validarUsuario, (req, res) => {
    let nuevoUsurio = req.body;

    usuarioController.usuarioExite(nuevoUsurio.username, nuevoUsurio.email)
        .then(usuarioExiste => {
            if (usuarioExiste) {
                log.warn(`Email [${nuevoUsurio.email}] o username [${nuevoUsurio.username}] ya existen en la base de datos`)
                res.status(409).send('El email o usuario ya estan asociados con una cuenta')
            }
            bcrypt.hash(nuevoUsurio.password, 10, (err, hashedPassword) => {
                if (err) {
                    log.error('Error ocurrió al tratar de obtener el has de una contraseña', err)
                    return
                }
                usuarioController.crearUsario(nuevoUsurio, hashedPassword)
                    .then(nuevoUsurio => {
                        res.status(201).send('Usuario creado exitosamente')
                    })
                    .catch(err => {
                        log.error('Error al  ocurrió al crear nuevo usuario', err)
                        res.status(500).send('Error ocurrio al crear nuevo usuario', err)
                    })
            })
        })
        .catch(err => {
            log.error(`Error ocurrió al tratar de verificar si usuario[${nuevoUsurio.username}] con email [${nuevoUsurio.email}] ya existe.`)
            res.status(500).send("Error ocurrió al tratar de crear nuevo usuario", err)
        })


})
module.exports = usuariosRouter