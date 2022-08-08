const Usuario = require('./usuarios.model')

function obtenerUsuarios() {
    return Usuario.find({})
}

function crearUsario(usuario, hashedPassword) {
    //Esto lo que hace es gabar en mongo
    return new Usuario({
        ...usuario,
        password: hashedPassword
    }).save
}
function usuarioExiste(username, email) {
    return newPromise((resolve, reject) => {
        Usuario.find().or([{ 'username': username }, { 'email': email }])
            .then(usuarios => {
                resolve(usuarios.length > 0)
            })
            .catch(err => {
                reject(err)
            })
    })
}

module.exports = {
    obtenerUsuarios,
    crearUsario,
    usuarioExiste

}