const _ = require('underscore')
const log = require('../../utils/logger')
const passportJWT = require('passport-jwt')

const bcrypt = require('bcrypt')
const usuarios = require('../../dataBase').usuarios
const config = require('./../../config')


let jwtOptions = {
    secretOrKey: config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {

    let index = _.findIndex(usuarios, usuario => usuario.id === jwtPayload.id)
    if (index === -1) {
        log.info(`JWT token no es walido. Usuario con id ${jwtPayload.id} no existe`)
        next(null, false)

    } else {
        //no hubo ningun error 
        log.info(`Usiuario ${usuarios[index].username} suministro un token valido. Autenticación completada`)
        next(null, {// le clavamos un objeto nuevo si la utenticacion es exitosa
            username: usuarios[index].username,
            id: usuarios[index].id
        })
    }
})

