const _ = require('underscore')
const log = require('../../utils/logger')
const usuarios = require('../../dataBase').usuarios
const bcrypt = require('bcrypt')

module.exports = (username, password, donne) => {// lo que hace es verificar si lo que esta llegando ala base de datos es corecta let 
    let index = _.findIndex(usuarios, usuario => usuario.username === username);
    // los usuarios no pueden ser procesados por que estamos proytegiendo la ruta
    if (index === -1) {
        log.info(`Usuario ${username} No existe. No pudo ser autenticado`)
        donne(null, false)
        return;
    }
    let hashedPassword = usuarios[index].password
    bcrypt.compare(password, hashedPassword, (err, iguales) => {
        if (iguales) {
            log.info(`Usuario ${username} Completo autenticacion`)
            donne(null, true)
            return
        } else {
            log.info(`Usuario ${username} No completó la autenticacion. Contraseña Incorrecta`)
            donne(null, false)
        }
    })


}