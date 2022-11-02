import express from 'express'
import fs from 'fs'
import http from 'http'
import https from 'https'

const app = express()

const configFile = fs.readFileSync('config.json')
const config = JSON.parse(configFile)

if (config.env === 'dev') {
    app.listen(3000, () => {
        console.log(`Listening at 3000`)
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

    const httpServer = http.createServer(app)
    const httpsServer = https.createServer(credentials, app)

    httpServer.listen(3001, () => {
        console.log('HTTP Server running on port 3001')
    })

    httpsServer.listen(3000, () => {
        console.log('HTTPS Server running on port 3000')
    })

    app.use(function (request, response, next) {
        response.header('Access-Control-Allow-Origin', 'https://labs.noshado.ws')
        response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        next()
    })
}

import router from './routes.js'

app.use(router)