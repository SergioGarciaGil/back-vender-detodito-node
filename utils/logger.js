const winston = require('winston');

//winston
const incluirFecha = winston.format((info) => {
    info.message = `${new Date().toISOString()} ${info.message}`
    return info
})
const logger = winston.createLogger({

    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),

            )
        }),
        new winston.transports.File({
            level: 'info',
            handleExceptions: true,
            format: winston.format.combine(
                incluirFecha(),
                winston.format.simple()
            ),
            maxsize: 5120000, // 5 Mb
            maxFiles: 5,
            filename: `${__dirname}/../logs/logslogs-de-aplicacion.log`
        })
    ]
})


logger.info(__dirname)
logger.info('HoLA Soy winston!', { compañia: "Palpaso" })
logger.error("Algo explotó")
logger.warn("Algo inesperado ocurrió")
logger.debug("llamadas de debug")


module.exports = logger