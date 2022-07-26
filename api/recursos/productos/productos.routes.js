const express = require('express');
const _ = require('underscore')
const { v4: uuidv4 } = require('uuid');
const passport = require('passport')

const validarProducto = require('./productos.validate')
const log = require('../../../utils/logger')
// const Producto = require('./productos.model')
const productosController = require('./productos.controller')


const jwtAutenticate = passport.authenticate('jwt', { sesion: false })


const productos = require('../../../dataBase').productos
const productosRouter = express.Router()



function validarId(req, res, next) {
    let id = req.params.id
    // regex = regular expressions
    if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
        log.error('El id [${id}] suministrado en el URL no es válido')
        res.status(400).send(`El id [${id}] suministrado en el URL no es válido`)
        return
    }
    next()
}

productosRouter.get('/', (req, res) => {
    productosController.obtenerProductos()
        .then(productos => {
            res.json(productos)
        })

})
productosRouter.post('/', [jwtAutenticate, validarProducto], (req, res) => {

    // aqui empieza la operacion asincrona para grabar en la base de datos de mongoDB
    productosController.crearProducto(req.body, req.user.username)
        .then(producto => {
            log.info(`producto agregado a la coleccion productos`, producto)
            res.status(201).json(producto)
        })
        .catch(err => {
            log.error('Producto no pudo ser creado', err)
            res.status(500).send('Error ocurrió al tratar de crear el producto')
        })

})

// app.get('/productos/:id', (req, res) => {
//     const id = req.params.id
//     const allProducts = productos

//     if (id) {
//         const producto = allProducts.filter((e) => e.id === id)
//         producto.length
//             ? res.status(200).send(producto)
//             : res.status(404).send(`Elptoducto con id: ${req.params.id} No exite`)

//     }
productosRouter.get('/:id', validarId, (req, res) => {
    let id = req.params.id;
    productosController.obtenerProducto(id)
        .then(producto => {
            if (!producto) {
                res.status(404).send(`El producto con id: ${req.params.id}No existe`)
            } else {
                res.json(producto)
            }
        })
        .catch(err => {
            log.error(`Excecion ocurrió al tratar de obtener producto con id [${id}]`, + err)
            res.status(500).send(`Error ocurrió obteniendo producto con id [${id}]`)
        })

})
productosRouter.put('/:id', [jwtAutenticate, validarProducto], (req, res) => {

    let remplazoParaProducto = {

        ...req.body,
        id: req.params.id,
        dueño: req.username
    }

    let indice = _.findIndex(productos, producto => producto.id == remplazoParaProducto.id)
    if (indice !== -1) {
        if (productos[indice].dueño !== remplazoParaProducto.dueño) {
            log.info(`Usuario ${req.user.username} no es dueño del producto con id ${remplazoParaProducto.id}.
            dueño real es ${productos[indice].dueño}. request no será procesado`)
            res.status(400).send(`No eres dueño del producto con id ${remplazoParaProducto.id} solo puedes modificar productos creados por ti`)
            return
        }

        productos[indice] = remplazoParaProducto
        log.info(`Producto con id[${remplazoParaProducto.id} remplazado con nuevo producto, remplazoParaProducto]`)
        res.status(200).json(remplazoParaProducto)
    } else {
        res.status(404).send(`El producto con id [${remplazoParaProducto.id}] no existe`)
    }


})
productosRouter.delete('/:id', jwtAutenticate, (req, res) => {
    let indiceBorrar = _.findIndex(productos, producto => producto.id == req.params.id)
    if (indiceBorrar === -1) {
        log.warn(`Producto con id [${req.params.id} No existe nada que borrar]`)
        res.status(404).send(`Producto con id [${req.params.id}] no existe. naDA QUE BORRAR`)
        return
    }
    if (productos[indiceBorrar].dueño !== req.user.username) {
        log.info(`Usuario ${req.user.username} no es dueño del producto con id ${productos[indiceBorrar].id}.
            dueño real es ${productos[indiceBorrar].dueño}. request no será procesado`)
        res.status(400).send(`No eres dueño del producto con id ${productos[indiceBorrar].id} solo puedes borrar productos creados por ti`)
        return
    }
    let borrado = productos.splice(indiceBorrar, 1)
    res.json(borrado)
})


module.exports = productosRouter