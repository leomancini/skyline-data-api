import express from 'express'

import filter from '../processing.js'
import initialize from '../initialize.js'

const router = express.Router()

router.get('/', async (req, res) => {
  if (req.query.building) {
      const { datetime, url, buffer, buildings } = await initialize(req.query.datetime)

      const image = await filter({
          buffer,
          type: req.query.type ? parseInt(req.query.type) : null,
          crop: buildings[req.query.building],
          size: {
              width: null,
              height: 700
          }
      })

      res.set({'Content-Type': 'image/jpg'})
      res.send(image)
  } else {
      res.send({
          'error': 'Please add type and building params!'
      })
  }
})

export default router