const _ = require('underscore')
const log = require('../../utils/logger')
const passportJWT = require('passport-jwt')
const config = require('./../../config')
const usuarioController = require('../recursos/usuarios/usuarios.controller')


let jwtOptions = {
    secretOrKey: config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {

    usuarioController.obtenerUsuario({ id: jwtPayload.id })
        .then(usuario => {
            if (!usuario) {
                log.info(`JWT token no es walido. Usuario con id ${jwtPayload.id} no existe`)
                next(null, false)// aqui le decimos que fallo la validacion del token
            }
            log.info(`Usuario ${usuario.username} suministro un token valido. Autenticación completada`)
            next(null, {
                username: usuario.username,
                id: usuario.id
            })
        })

        .catch(err => {
            log.error("Error ocurrió al tratar de validar un token", err)
            next(err)

        })
})

