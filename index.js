const express = require('express');
const bodyParser = require('body-parser')
const morgan = require('morgan')
const logger = require('./utils/logger')
const productosRouter = require('./api/recursos/productos/productos.routes')

const app = express()


app.use(bodyParser.json())// body parser se encarga de hacer el proceso en el body o request
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message.trim())
    }
}))// combine es solo un formato de diseño

app.use('/productos', productosRouter)



app.get('/', (req, res,) => {
    res.send('APi de Vende tus corotos')
})


app.listen(3000, () => {
    logger.info('Escuchando en el puerto 3000')
})