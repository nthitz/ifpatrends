const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(`${__dirname}/../data.sqlite3`)

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/getPlayerData', (request, response) => {
  console.log(request.body.ids)
  let error = null
  const ids = request.body.ids.map(id => {
    const v = parseInt(id, 10)
    if (isNaN(v)) {
      error = 'bad ids'
    }
    return v
  })
  if (error != null) {
    response.send({error})
    return
  }
  db.all(
    `SELECT * FROM player_history WHERE player_id IN (${ids.join(',')})`,
    [],
    (error, rows) => {
      if (error) throw error
      response.send(rows)
    }
  )
})

app.listen(4000, () => console.log('Example app listening on port 4000!'))