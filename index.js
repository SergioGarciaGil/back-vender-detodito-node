const express = require('express');
const bodyParser = require('body-parser')
const morgan = require('morgan')
const logger = require('./utils/logger')
const productosRouter = require('./api/recursos/productos/productos.routes')
const usuariosRouter = require('./api/recursos/usuarios/usuarios.routes')
const authJWT = require('./api/libs/auth')


const passport = require('passport');
//Autenticación  de contraseña y usernamE
passport.use(authJWT)

const app = express()


app.use(bodyParser.json())// body parser se encarga de hacer el proceso en el body o request
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message.trim())
    }
}))// short es solo un formato de diseño



app.use(passport.initialize())// l desimos a express que procese la autenticacion desde http para que entre



app.use('/productos', productosRouter)
app.use('/usuarios', usuariosRouter)


app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    logger.info(req.user.username)
    res.send('API DE VENDE TUS COROTOS')
})


app.listen(3000, () => {
    logger.info('Escuchando en el puerto 3000')
})