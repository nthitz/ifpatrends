const sqlite3 = require('sqlite3')
const locationHash = require('../utils/locationHash')
const db = new sqlite3.Database(`${__dirname}/../data.sqlite3`)
const locations = {}

db.each(
  'SELECT listData, fullData, tournament_id FROM tournaments_raw',
  [],
  (error, row) => {
    if (error) throw error
    const listData = JSON.parse(row.listData)
    const fullData = JSON.parse(row.fullData)
    const location = {
      country_code: listData.country_code,
      country_name: fullData.country_name,
      state: fullData.state,
      city: fullData.city,
    }
    location.hash = locationHash(location)
    locations[location.hash] = location
    // if (location.country_code === 'JP') {
    //   console.log('JP', row.tournament_id)
    // }
  },
  (error, rowCount) => {
    if (error) throw error
    insertLocations(locations)
  }
)

let allLocations = null
function insertLocations(locationMap) {
  allLocations = Object.keys(locationMap).map(i => locationMap[i])
  allLocations.forEach(location => {
    const insertLocation = () => {
      db.run(
        `INSERT INTO locations
          (country_code, country_name, state, city, hash)
          VALUES (?, ?, ?, ?, ?)`,
        [location.country_code, location.country_name, location.state,
          location.city, location.hash],
        checkIfDone()
      )
    }
    const checkCount = (error, result) => {
      if (error) throw error
      if (result.count == 0) {
        insertLocation()
      } else {
        checkIfDone()
      }
    }
    const queryIfExists = () => {
      console.log(location.hash)
      db.get(
        'SELECT COUNT(*) as count FROM locations WHERE hash=?',
        [location.hash],
        checkCount
      )
    }
    queryIfExists()
  })
}
let numDone = 0
function checkIfDone() {
  numDone ++
  console.log(numDone, allLocations.length)
  if (numDone === allLocations.length) {
    db.close()
    console.log('okokok')
  }
}