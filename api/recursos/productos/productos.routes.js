const express = require('express');
const _ = require('underscore')
const { v4: uuidv4 } = require('uuid');
const passport = require('passport')

const validarProducto = require('./productos.validate')
const log = require('../../../utils/logger')


const jwtAutenticate = passport.authenticate('jwt', { sesion: false })


const productos = require('../../../dataBase').productos
const productosRouter = express.Router()





productosRouter.get('/', (req, res) => {

    res.json(productos)
})
productosRouter.post('/', [jwtAutenticate, validarProducto], (req, res) => {
    // let newProduct = req.body;
    let newProduct = {
        ...req.body,
        id: uuidv4(),
        dueño: req.user.username
    }


    productos.push(newProduct)
    log.info(`producto agregado a la coleccion productos`, newProduct)
    res.status(201).json(newProduct)
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
productosRouter.get('/:id', (req, res) => {
    for (let producto of productos) {
        if (producto.id === req.params.id) {
            res.json(producto)
            return

        }
    }
    res.status(404).send(`El producto con id: ${req.params.id}No existe`)
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