const cors = require('cors')

//set up whitelist
const whitelist = ['http://localhost:3000', 'https://localhost:3443']
const corsOptionsDelegate = (req, callback) => {
    let corsOptions
    console.log(req.header('Origin'))
    //see if origin can be found in whitelist
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } //true: origin was accepted
    } else { //origin not in whitelist
        corsOptions = { origin: false }
    }
    callback(null, corsOptions)
}

exports.cors = cors() // allows all options
exports.corsWithOptions = cors(corsOptionsDelegate) // check if request on whitelist