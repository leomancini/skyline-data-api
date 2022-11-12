import express from 'express'
import fs from 'fs'
import http from 'http'
import https from 'https'

const app = express()

const configFile = fs.readFileSync('config.json')
const config = JSON.parse(configFile)

if (config.env === 'dev') {
    app.listen(3085, () => {
        console.log('HTTP server running on port 3085')
    })

    app.use(function (request, response, next) {
        response.header('Access-Control-Allow-Origin', 'http://localhost')
        response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        next()
    })
} if (config.env === 'prod') {
    const privateKey = fs.readFileSync(`${config.ssl}/privkey.pem`, 'utf8')
    const certificate = fs.readFileSync(`${config.ssl}/cert.pem`, 'utf8')
    const ca = fs.readFileSync(`${config.ssl}/chain.pem`, 'utf8')

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    }

    const httpsServer = https.createServer(credentials, app)

    httpsServer.listen(3085, () => {
        console.log('HTTPS server running on port 3085')
    })

    app.use(function (request, response, next) {
        response.header('Access-Control-Allow-Origin', 'https://labs.noshado.ws')
        response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        next()
    })
}

import hash from './routes/hash.js'
import filter from './routes/filter.js'

app.use('/skyline/hash', hash);
app.use('/skyline/filter', filter);