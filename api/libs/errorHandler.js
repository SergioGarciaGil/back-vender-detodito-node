const log = require('../../utils/logger')

exports.procesarErrores = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch((err) => {
            log.error("dentro de procesarErrores", err)
        })
    }
}

// let procesarErrores = (fn) => {
//     return function () {
//         fn().catch((err) => {
//             console.log("dentro de procesar errores", err)
//         })
//     }
// }

// let llamadaAsincrona = function () {
//     return new Promise((resolve, reject) => {
//         // setTimeout(resolve, 100) //resuleve en 100 milisegundos
//         reject(new Error())
//     })
// }
// let funcionQueHaceLlamadaAsincrona = () => {
//     return llamadaAsincrona()
//         .then(() => {
//             console.log("promesa resuelta")
//         })
//         .catch((err) => {
//             console.log("error", err)
//         })
// }
// let llamadaAsincronaProtegida = procesarErrores(funcionQueHaceLlamadaAsincrona)
// llamadaAsincronaProtegida()

