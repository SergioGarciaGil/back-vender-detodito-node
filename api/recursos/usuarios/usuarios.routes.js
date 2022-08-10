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

//middleware para tranformar body a mayusculas

function transformarBodyALowerCase(req, res, next) {
    req.body.username && (req.body.username = req.body.username.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()//llamamos a next para que complete la suiguiente funcion en la cadena
}

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

usuariosRouter.post('/', [validarUsuario, transformarBodyALowerCase], (req, res) => {
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
                        res.status(201).send(`usuario creado éxitosamente`)
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

usuariosRouter.post('/login', [validarPedidoDeLogin, transformarBodyALowerCase], async (req, res) => {
    let usuarioNoAutenticado = req.body
    let usuarioRegistrado
    try {
        usuarioRegistrado = await usuarioController.obtenerUsuario({
            username: usuarioNoAutenticado.username
        })
    } catch (err) {
        log.error(`Error ocurrió al tratar de determinar si el usuario[${usuarioNoAutenticado.username}] ya existe`, err)
        res.status(500).send('Error ocurrió durante el proceso de login')
    }
    if (!usuarioRegistrado) {
        log.error(`Usuario [${usuarioNoAutenticado.username}] No existe. No pudo ser Autenticado`)
        res.status(400).send('Credenciales incorrectas. Asegurate que el username y contraseña son correctas')
        return
    }
    let contraseñaCorrecta
    try {
        contraseñaCorrecta = await bcrypt.compare(usuarioNoAutenticado.password, usuarioRegistrado.password)
    } catch (err) {
        log.error(`Error ocurrio al tratar de verificar si la contraseña es correcta `, err)
        res.status(500).send('Error ocurrio durante el proceso de login')
        return
    }
    if (contraseñaCorrecta) {

        let token = jwt.sign({ id: usuarioRegistrado.id }, config.jwt.secreto, { expiresIn: '1s' })
        log.info(`Usuario ${usuarioNoAutenticado.username} completo autenticación exitosamente.`)
        res.status(200).json({ token })
    } else {
        log.info(`Usuario ${usuarioNoAutenticado.username} no completo autenticación. Contraseña incorrecta`)
        throw new CredencialesIncorrectas()
    }
})



module.exports = usuariosRouter