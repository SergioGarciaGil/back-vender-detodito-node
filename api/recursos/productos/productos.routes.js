const express = require('express');
const _ = require('underscore')
const { v4: uuidv4 } = require('uuid');
const validarProducto = require('./productos.validate')



const productos = require('../../../dataBase').productos
const productosRouter = express.Router()





productosRouter.get('/', (req, res) => {

    res.json(productos)
})
productosRouter.post('/', validarProducto, (req, res) => {
    let newProduct = req.body;



    newProduct.id = uuidv4()

    productos.push(newProduct)
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
productosRouter.put('/:id', validarProducto, (req, res) => {
    let id = req.params.id
    let remplazoParaProducto = req.body
    if (!remplazoParaProducto.title || !remplazoParaProducto.precio || !remplazoParaProducto.moneda) {
        res.status(400).send('Tu producto debe especificar un título, precio y moneda')
        return

    }
    let indice = _.findIndex(productos, producto => producto.id == id)
    if (indice !== -1) {
        remplazoParaProducto.id = id
        productos[indice] = remplazoParaProducto
        res.status(200).json(remplazoParaProducto)
    } else {
        res.status(404).send(`El producto con id [${id}] no existe`)
    }


})
productosRouter.delete('/:id', (req, res) => {
    let indiceBorrar = _.findIndex(productos, producto => producto.id == req.params.id)
    if (indiceBorrar === -1) {
        res.status(404).send(`Producto con id [${req.params.id}] no existe. naDA QUE BORRAR`)
        return
    }
    let borrado = productos.splice(indiceBorrar, 1)
    res.json(borrado)
})


module.exports = productosRouter