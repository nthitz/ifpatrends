const sqlite3 = require('sqlite3')
const request = require('request')
const db = new sqlite3.Database(`${__dirname}/../data.sqlite3`)
require('dotenv').config()

const key = process.env.GEOCODINGKEY

let rows = null
db.all(
  'SELECT * FROM locations WHERE latitude IS NULL and longitude IS NULL',
  [],
  (error, _rows) => {
    if (error) throw error
    rows = _rows
    getNextRow()
  }
)

function getNextRow() {
  if (rows.length === 0) {
    return db.close()
  }
  const row = rows.pop()
  const address = encodeURIComponent(
    `${row.city} ${row.country_code === 'US' ? `${row.state},` : ''} ${row.country_name}`
  )
  const api = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`
  console.log(api)
  request(api, (error, response, body) => {
    if (error) throw error
    const data = JSON.parse(body)
    let lat = null, lng = null;
    try {
      lat = data.results[0].geometry.location.lat
      lng = data.results[0].geometry.location.lng
    } catch (e) {
      console.log('error on row')
      console.log(row)
      setTimeout(getNextRow, 900 + Math.random() * 200)
      return
    }
    if (lat !== null && lng !== null) {
      db.run(
        'UPDATE locations SET latitude=?, longitude=? WHERE location_id=?',
        [lat, lng, row.location_id],
        (error) => {
          if (error) throw error
          setTimeout(getNextRow, 900 + Math.random() * 200)
        }
      )
    }
  })
}
