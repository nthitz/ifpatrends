const fs = require('fs')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database(`${__dirname}/../data.sqlite3`)

db.all('SELECT listData FROM tournaments_raw', [], (error, results) => {
  console.log(results.length)
  const resultObjects = results.map(r => JSON.parse(r.listData))
  fs.writeFileSync('tournaments.json', JSON.stringify(resultObjects))
})