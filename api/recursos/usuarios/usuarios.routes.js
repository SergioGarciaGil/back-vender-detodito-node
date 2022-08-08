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
    usuarioController.obtenerUsuarios()
        .then(usuarios => {
            res.json(usuarios)
        })
        .catch(err => {
            log.error('Error al obtener todos los usuarios', err)
            res.sendStatus(500)
        })
})

usuariosRouter.post('/', validarUsuario, (req, res) => {
    let nuevoUsuario = req.body;

    return usuarioController.usuarioExiste(nuevoUsuario.username, nuevoUsuario.email)
        .then(usuarioExiste => {
            if (usuarioExiste) {
                log.warn(`Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existen en la base de datos`)
                res.status(409).send('El email o usuario ya estan asociados con una cuenta')
                return
            }
            bcrypt.hash(nuevoUsuario.password, 10, (err, hashedPassword) => {
                if (err) {
                    log.error("Error ocurrió al tratar de obtener el hash de una contraseña", err)
                    res.status(500).send("Error procesado creacion de usuario")
                    return
                }
                usuarioController.crearUsuario(nuevoUsuario, hashedPassword)
                    // res.status(201).send(nuevoUsuario)
                    .then(nuevoUsuario => {
                        res.status(201).send(`usuario [${nuevoUsuario}] creado éxitosamente`)
                    })
                    .catch(err => {
                        log.error("Error ocurrió al tratar de crear nuevo usuario")
                        res.status(500).send("Error ocurrio al tratar de crear nuevo usuario!!", err)
                    })
            })
        })


        .catch(err => {
            log.error(`Error ocurrió al tratar de verificar si usuario[${nuevoUsuario.username}] con email [${nuevoUsuario.email}] ya existe.`)
            res.status(500).send("Error ocurrió al tratar de crear nuevo usuario", err)
        })
})






module.exports = usuariosRouter