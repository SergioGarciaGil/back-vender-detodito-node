const express = require('express');
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid');
const { restart } = require('nodemon');
const { uuid } = require('uuidv4');

const app = express()
const productos = [
    {
        id: '1234', title: 'MacBook', precio: 10500, moneda: 'USD'
    },
    {
        id: 'as12de', title: 'Tazade café', precio: 20, moneda: 'USD',

    },
    {
        id: 'ttttt', title: 'Microfono', precio: 500, moneda: 'USD'
    }
]

app.use(bodyParser.json())

app.route('/productos')
    .get((req, res) => {
        console.log(productos)
        res.json(productos)
    })
    .post((req, res) => {
        let newProduct = req.body;
        if (!newProduct.title || !newProduct.precio || !newProduct.moneda) {
            res.status(400).send('Tu producto debe especificar un título, precio y moneda')
            return

        }

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
app.get('/productos/:id', (req, res) => {
    for (let producto of productos) {
        if (producto.id === req.params.id) {
            res.json(producto)
            return

        }
    }
    res.status(404).send(`El producto con id: ${req.params.id}No existe`)
})

// res.status(404).send(`El producto con id: ${req.params.id} No exosite`)

//     for (let producto of productos) {
//         if (producto.id === req.params.id) {
//             res.json(producto)
//             return
//         }
//     }
//     res.status(404).send(`El producto con id: ${req.params.id} no existe`)



app.get('/', (req, res,) => {
    res.send('APi de Vende tus corotos')
})


app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000')
})
