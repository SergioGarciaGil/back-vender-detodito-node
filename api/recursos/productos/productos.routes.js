const express = require("express");
const _ = require("underscore");

const passport = require("passport");

const validarProducto = require("./productos.validate");
const log = require("../../../utils/logger");
// const Producto = require('./productos.model')
const productosController = require("./productos.controller");

const jwtAutenticate = passport.authenticate("jwt", { sesion: false });

const productos = require("../../../dataBase").productos;
const procesarErrores = require("../../libs/errorHandler").procesarErrores

const productosRouter = express.Router();

function validarId(req, res, next) {
    let id = req.params.id;
    // regex = regular expressions
    if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
        log.error("El id [${id}] suministrado en el URL no es válido");
        res.status(400).send(`El id [${id}] suministrado en el URL no es válido`);
        return;
    }
    next(); //nos lleva ala siguiente funcion de la cadena de midelware
}

productosRouter.get("/", (req, res) => {
    productosController.obtenerProductos().then((productos) => {
        res.json(productos);
    });
});
productosRouter.post("/", [jwtAutenticate, validarProducto], procesarErrores((req, res) => {
    // aqui empieza la operacion asincrona para grabar en la base de datos de mongoDB
    return productosController
        .crearProducto(req.body, req.user.username)
        .then((producto) => {
            log.info(`producto agregado a la coleccion productos`, producto.toObject());
            res.status(201).json(producto);
        })
    // .catch((err) => {
    //     log.error("Producto no pudo ser creado", err);
    //     res.status(500).send("Error ocurrió al tratar de crear el producto");
    // });
}));


productosRouter.get("/:id", validarId, (req, res) => {
    let id = req.params.id;
    productosController
        .obtenerProducto(id)
        .then((producto) => {
            if (!producto) {
                res.status(404).send(`El producto con id:[ ${id}]No existe`);
            } else {
                res.json(producto);
            }
        })
        .catch((err) => {
            log.error(
                `Excecion ocurrió al tratar de obtener producto con id [${id}]`,
                +err
            );
            res.status(500).send(`Error ocurrió obteniendo producto con id [${id}]`);
        });
});
productosRouter.put("/:id", [jwtAutenticate, validarProducto], async (req, res) => {
    let id = req.params.id;
    let requestUsuario = req.user.username;
    let productoReemplazar

    try {
        productoReemplazar = await productosController.obtenerProducto(id)


    } catch (err) {
        log.warn(`Execpción ocurrió un error al procesar la modificación del producto id: [${id}]`, err)



    }
    if (!productoReemplazar) {
        res.status(404).send(`El producto con id [${id}] no existe`)
        return
    }
    if (productoReemplazar.dueño !== requestUsuario) {
        log.warn(`Usuario[${requestUsuario}] no es dueño de producto con id [${id}]. Dueño real es [${productoReemplazar.dueño}]. Request no sera procesado`)
        res.status(401).send(`No eres dueño del producto con id[${id}].solo puede modificar productos creados por ti`)
        return
    }
    productosController.reemplazarProducto(id, req.body, requestUsuario)
        .then(producto => {
            res.json(producto)
            log.info(`Producto con id [${id} reemplazado con nuevo producto]`, producto.toObject())

        })
        .catch(err => {
            log.error(`Excepción al tratar de remplazar producto con id [${id}]`, err)
            res.status(500).send(`Error ocurrió reemplazando producto con id[${id}]`)
        })

});
productosRouter.delete(
    "/:id",
    [jwtAutenticate, validarId],
    async (req, res) => {
        let id = req.params.id;
        let productoBorrar;

        try {
            productoBorrar = await productosController.obtenerProducto(id);
        } catch (err) {
            log.error(
                `Execpción ocurrió al procesar el borrado de producto con id [${id}]`,
                err
            );
            res.status(500).send(`Error ocurrió borrando producto con id [${id}]`);
            return;
        }

        if (!productoBorrar) {
            log.info(`Producto con id [${id} No existe nada que borrar]`);
            res
                .status(404)
                .send(`Producto con id [${id}] no existe. naDA QUE BORRAR`);
            return;
        }

        let usuarioAutenticado = req.user.username;

        if (productoBorrar.dueño !== usuarioAutenticado) {
            log.info(`Usuario [${usuarioAutenticado}] no es dueño del producto con id [${id}].
            dueño real es ${productoBorrar.dueño}}. request no será procesado`);
            res
                .status(401)
                .send(
                    `No eres dueño del producto con id [${id}] solo puedes borrar productos creados por ti`
                );
            return;
        }
        try {
            let productoBorrado = await productosController.borrarProducto(id);
            log.info(`Producto con id [${id}] fue borrado`)
            res.json(productoBorrado)
        } catch (error) {
            res.status(500).send(`Error ocurrió borrando producto con id [${id}]`)
        }


    }
);

module.exports = productosRouter;
