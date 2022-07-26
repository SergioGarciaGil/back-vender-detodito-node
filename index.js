const express = require('express');
const bodyParser = require('body-parser')
const session = require('express-session');
const morgan = require('morgan')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

const productosRouter = require('./api/recursos/productos/productos.routes')
const usuariosRouter = require('./api/recursos/usuarios/usuarios.routes')
const authJWT = require('./api/libs/auth')
const config = require('./config')


const passport = require('passport');
//Autenticación  de contraseña y usernamE
passport.use(authJWT)


mongoose
    .connect('mongodb+srv://tienda-mongo:Sergio2772@cluster0.uamer.mongodb.net/?retryWrites=true&w=majority')
    .then(() => logger.info("connect to MomgoDB Atlas"))
    .catch((err) => logger.error('Fallo la coneccion a mongoDB, error: ' + err));

// mongoose.connection.on('error', () => {
//     logger.error('Fallo la conexion a mongoDB')
//     process.exit(1)

// })

const app = express()


app.use(bodyParser.json())// body parser se encarga de hacer el proceso en el body o request
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message.trim())
    }
}))// short es solo un formato de diseño



app.use(passport.initialize())// l desimos a express que procese la autenticacion desde http para que entre


app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'esto es un secreto'
}));
// Passport usa serializeUserla función para conservar los datos del usuario (después de una autenticación exitosa) en la sesión. La función deserializeUserse utiliza para recuperar datos de usuario de la sesión.
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});


app.use('/productos', productosRouter)
app.use('/usuarios', usuariosRouter)


app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    logger.info(req.user.username)
    res.send('API DE VENDE TUS COROTOS')
})


app.listen(config.puerto, () => {
    logger.info('Escuchando en el puerto 3000')
})