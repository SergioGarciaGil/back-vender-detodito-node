
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 1,
        rquired: [true, 'usuario debe tener un username']
    },
    password: {
        type: String,
        minlength: 1,
        required: [true, 'usuario debe tener una contrtaseña']
    },

    email: {
        type: String,
        minlength: 1,
        require: [true, 'usuario debe tener un email']
    }
})

module.exports = mongoose.model('usuario', usuarioSchema)