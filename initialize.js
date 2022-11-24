import axios from 'axios'
import moment from 'moment'

export default async function initialize(datetime) {
    if (!datetime) {
        datetime = moment().subtract(1, 'minutes').format('YYYY-MM-DD-HH-mm')
    } 

    let url = `http://skyline.noshado.ws/nest-cam-timelapse/images/SKYLINE/${datetime}.jpg`

    console.log(datetime)

    const imageResponse = await axios({url: url, responseType: 'arraybuffer'})
    const buffer = Buffer.from(imageResponse.data, 'binary')

    let buildings = {
        'FreedomTower': { left: 141, top: 450, width: 18, height: 66 },
        'StuyvesantTown': { left: 0, top: 546, width: 290, height: 50 },
        'WatersidePlazaTower1': { left: 307, top: 511, width: 40, height: 103 },
        'WatersidePlazaTower2': { left: 345, top: 511, width: 24, height: 86 },
        'WatersidePlazaTower3': { left: 392, top: 511, width: 38, height: 98 },
        'WatersidePlazaTower4': { left: 460, top: 521, width: 40, height: 91 },
        'NYULangone1': { left: 709, top: 543, width: 62, height: 57 },
        'NYULangone2': { left: 782, top: 516, width: 157, height: 80 },
        'RivergateAparments': { left: 980, top: 517, width: 55, height: 85 },
        'EmpireStateBuilding': { left: 1060, top: 375, width: 40, height: 80 },
        'TheCopper': { left: 1053, top: 465, width: 54, height: 132 },
        'ManhattanPlace': { left: 1138, top: 513, width: 38, height: 75 },
        'HorizonCondominium': { left: 1202, top: 485, width: 40, height: 108 },
        'OneUNPark': { left: 1328, top: 475, width: 48, height: 114 },
        'WindsorTower': { left: 1396, top: 528, width: 52, height: 63 },
        'OneVanderbilt': { left: 1401, top: 355, width: 25, height: 108 },
        'ChryslerBuilding': { left: 1437, top: 401, width: 20, height: 90 },
        'MetLifeBuilding': { left: 1466, top: 435, width: 27, height: 56 },
        'UNBuilding': { left: 1590, top: 450, width: 80, height: 150 },
        'TrumpWorldTower': { left: 1785, top: 386, width: 34, height: 182 },
        '432ParkAvenue': { left: 1836, top: 375, width: 20, height: 72 },
        'ConsulatesAtUNPlaza': { left: 1866, top: 498, width: 54, height: 78 },
        'UThantIsland': { left: 1740, top: 622, width: 57, height: 30 },
        'HuntersPointSouth': { left: 0, top: 898, width: 65, height: 120 },
        'LongIslandCity': { left: 1505, top: 965, width: 415, height: 110 },
        'EastRiverSample1': { left: 293, top: 713, width: 150, height: 150 },
        'EastRiverSample2': { left: 924, top: 729, width: 150, height: 150 },
        'EastRiverSample3': { left: 1619, top: 774, width: 150, height: 150 }
    }

    return {
        datetime,
        url,
        buffer,
        buildings
    }
}