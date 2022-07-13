const Joi = require('@hapi/joi');


const blueprintProducto = Joi.object({
    title: Joi.string().max(100).required(),
    precio: Joi.number().positive().precision(2).required(),
    moneda: Joi.string().length(3).uppercase()
})

module.exports = (req, res, next) => {

    resultado = blueprintProducto.validate(req.body, { abortEarly: false, convert: false })

    if (resultado.error === undefined) {
        next() //vamos al siguiente funcion de la cadena el colback d productRouter
    } else {
        let errorDeValidation = resultado.error.details.reduce((acumulador, error) => {
            return acumulador + `[${error.message}]`

        }, "")

        res.status(400).send(`El producto debe especificar title, precio, moneda. errrores: ${errorDeValidation}`);

    }
}

