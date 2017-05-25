const fs = require('fs')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database(`${__dirname}/../data.sqlite3`)

db.exec(fs.readFileSync(`${__dirname}/schema.sql`).toString())

console.log(db)
