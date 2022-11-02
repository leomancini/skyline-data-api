import express from 'express'
import sharp from 'sharp'
import axios from 'axios'
import moment from 'moment'

const router = express.Router()

async function filterImage(params) {
    let { buffer, type, crop, size } = params
    let image

    if (type === 1) {
        image = await sharp(buffer)
            .gamma(3)
            .sharpen(10)
            .median(100)
            .clahe({
                width: 2,
                height: 2
            })
            .normalise()
            .modulate({
                saturation: 50
            })
            .extract(crop)
            .resize(size.width, size.height)
            .toBuffer()
    } else if (type === 2) {
        image = await sharp(buffer)
            .gamma(3)
            .sharpen(50)
            .median(10)
            .clahe({
                width: 5,
                height: 5
            })
            .extract(crop)
            .resize(size.width, size.height, {
                kernel: sharp.kernel.nearest,
                fit: 'contain',
                position: 'right top',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .normalise()
            .toBuffer()
    } else if (type === 3) {
        image = await sharp(buffer)
            .greyscale()
            .gamma(3)
            .sharpen(100)
            .median(10)
            .clahe({
                width: 5,
                height: 5
            })
            .normalise()
            .extract(crop)
            .resize(size.width, size.height)
            .toBuffer()
    } else {
        image = await sharp(buffer)
            .extract(crop)
            .resize(size.width, size.height)
            .toBuffer()
    }

    return image
}

router.get('/filter', async (req, res) => {
    let datetime = moment().subtract(1, 'minutes').format('YYYY-MM-DD-HH-mm')

    let url = `http://skyline.noshado.ws/nest-cam-timelapse/images/SKYLINE/${datetime}.jpg`

    const imageResponse = await axios({url: url, responseType: 'arraybuffer'})
    const buffer = Buffer.from(imageResponse.data, 'binary')

    let buildings = {
        'EmpireStateBuilding': { left: 1060, top: 375, width: 40, height: 80 },
        'UNBuilding': { left: 1590, top: 450, width: 80, height: 150 }
    }

    if (req.query.building) {
        const image = await filterImage({
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