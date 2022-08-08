const Producto = require('./productos.model')

function crearProducto(producto, dueño) {
    // return Promise.reject("Falla forzada")
    return new Producto({
        ...producto,
        dueño
    }).save()
}

function obtenerProductos() {
    return Producto.find({})
}
function obtenerProducto(id) {
    return Producto.findById(id)
}
function borrarProducto(id) {

    return Producto.findByIdAndRemove(id)
}
function reemplazarProducto(id, producto, username) {
    return Producto.findOneAndUpdate({ _id: id }, {//  le decimos a mongoose que una vez que encuentreproducto con id , graba esto que le estoy pasando
        ...producto,
        dueño: username
    }, {
        new: true //La opción new es para que la llamada regrese el nuevo documento modificado
    })
}


module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    borrarProducto,
    reemplazarProducto

}