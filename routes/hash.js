import express from 'express'
import sharp from 'sharp'

import filter from '../processing.js'
import initialize from '../initialize.js'

const router = express.Router()

router.get('/', async function(req, res) {
  if (req.query.building) {
      const { datetime, url, buffer, buildings } = await initialize(req.query.datetime)

      const size = {
          width: null,
          height: 200,
          scale: 10
      }

      const image1 = await filter({
          buffer,
          type: 3,
          crop: buildings[req.query.building],
          size
      })

      const image2 = await sharp(image1)
          .resize(8, null, { kernel: sharp.kernel.nearest })
          .toBuffer()

      const image3 = await sharp(image2)
          .resize(size.width ? Math.round(size.width / size.scale) : null, size.height ? Math.round(size.height / size.scale) : null, { kernel: sharp.kernel.nearest })
          .toBuffer()

      let imageFinal

      if (req.query.showHashImage) {
          imageFinal = await sharp(image3)
              .toBuffer()

          res.set({'Content-Type': 'image/jpg'})
          res.send(imageFinal)
      } else {
          imageFinal = await sharp(image3)
              .raw()
              .toBuffer({ resolveWithObject: true })
              
          const data = imageFinal.data.toJSON().data
          const dataString = data.join('')

          const output = {
              building: req.query.building,
              datetime,
              hash: dataString
          }

          res.set({'Content-Type': 'application/json'})
          res.send(output)
      }
  } else {
      res.send({
          'error': 'Please add type and building params!'
      })
  }
});

export default router