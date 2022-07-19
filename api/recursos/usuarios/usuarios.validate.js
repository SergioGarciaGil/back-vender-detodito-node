const Joi = require('@hapi/joi');
const log = require('../../../utils/logger')

const blueprintUsuario = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
    email: Joi.string().email().required()
})

let validarUsuario = (req, res, next) => {
    const resultado = blueprintUsuario.validate(req.body, { abortEarly: false, convert: false })

    if (resultado.error === undefined) {
        next()
    } else {
        log.info("Producto falló la validación", resultado.error.details.map(error => error.message))
        res.status(400).send("Información del usuario no cumple los requisitos. El nombre del usuario debe ser alafanúmerico y tener entre 3 y 30 carácteres. La contraseña debe tener entre 6 y 200 carácteres. Asegúrate de que el email sea válido.")
    }
}

const blueprintPedidoDeLogin = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})

let validarPedidoDeLogin = (req, res, next) => {
    const resultado = blueprintPedidoDeLogin.validate(req.body, { abortEarly: false, convert: false })
    if (resultado.error === undefined) {
        next()
    } else {
        res.status(400).send("Login falló. Debes especificar el username y contraseña del usuario. Ambos deben strings.")
    }
}

module.exports = {
    validarPedidoDeLogin,
    validarUsuario
}