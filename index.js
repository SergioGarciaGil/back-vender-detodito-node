const express = require('express');
const bodyParser = require('body-parser')

const { restart } = require('nodemon');

const productosRouter = require('./api/recursos/productos/productos.routes')

const app = express()


app.use(bodyParser.json())

app.use('/productos', productosRouter)



app.get('/', (req, res,) => {
    res.send('APi de Vende tus corotos')
})


app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000')
})