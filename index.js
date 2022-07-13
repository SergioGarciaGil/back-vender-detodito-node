const express = require('express');
const bodyParser = require('body-parser')

const productosRouter = require('./api/recursos/productos/productos.routes')
const winston = require('winston');

//winston
const incluirFecha = winston.format((info) => {
    info.menssage = `${new Date().toISOString()} ${info.menssage}`
    return info
})
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
})
new winston.transports.File({
    level: 'info',
    handleExceptions: true,
    format: winston.format.combine(
        incluirFecha(),
        winston.format.simple()
    ),
    maxSize: 5120000, //5mb
    maxFiles: 5,
    filename: `${__dirname}/log-de-aplicacion.log`

})

logger.info('HoLA Soy winston!')
logger.error("Algo explotó")
logger.warn("Algo inesperado ocurrió")
logger.debug("llamadas de debug")

const app = express()


app.use(bodyParser.json())

app.use('/productos', productosRouter)



app.get('/', (req, res,) => {
    res.send('APi de Vende tus corotos')
})


app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000')
})