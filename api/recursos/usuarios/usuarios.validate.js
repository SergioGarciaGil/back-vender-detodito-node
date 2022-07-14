const Joi = require('@hapi/joi');
const log = require('../../../utils/logger')

const blueprintUsuario = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
    email: Joi.string().email().required(),
})

module.exports = (req, res, next) => {
    const resultado = blueprintUsuario.validate(req.body, {
        abortEarly: false,
        convert: false,
    });
    if (resultado.error === undefined) {
        next()
    } else {
        log.info('Producto fallo la validacion', resultado.error.details.map(error => error.message)),
            res.status(400).send("Informacion de usuario no cumpl con los requisitos. El nombre de usuario debe ser alfhanumerico y tner entre 3 y 30 caavteres. La contraseña debe tener entre 6 y 200 caractees. Asegurate de que el email sea válido.")
    }
};
