import express from 'express'
import sharp from 'sharp'
import axios from 'axios'
import moment from 'moment'

const router = express.Router()

export default async function filter(params) {
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