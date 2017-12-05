// API documentation https://www.ifpapinball.com/api/documentation/tournament/
const fs = require('fs')
const request = require('request')
const sqlite3 = require('sqlite3')
require('dotenv').config()

const db = new sqlite3.Database(`${__dirname}/../data.sqlite3`)

const IFPAKEY = process.env.IFPAKEY

function selectNext() {
  let resultsData = null
  let tournamentData = null
  let tournamentId = null
  const requestResults = (error, row) => {
    if (error) throw error
    if (!row) {
      return db.close()
    }
    tournamentId = row.tournament_id
    console.log(tournamentId)
    const resultsAPI = `https://api.ifpapinball.com/v1/tournament/${tournamentId}/results?api_key=${IFPAKEY}`
    request(resultsAPI, (error, response, body) => {
      if (error) throw error
      const results = JSON.parse(body)
      resultsData = JSON.stringify(results.tournament)
      setTimeout(requestTournamentData, 200)
    })
  }
  const requestTournamentData = () => {
    const tournamentAPI = `https://api.ifpapinball.com/v1/tournament/${tournamentId}?api_key=${IFPAKEY}`
    request(tournamentAPI, (error, response, body) => {
      if (error) throw error
      const results = JSON.parse(body)
      tournamentData = JSON.stringify(results.tournament)
      insertData()
    })
  }

  const insertData = () => {
    // console.log(tournamentData, resultsData, tournamentId)
    db.run(
      'UPDATE tournaments_raw SET fullData=?, resultData=? WHERE tournament_id=?',
      [tournamentData, resultsData, tournamentId],
      (error) => {
        if (error) throw error
        setTimeout(selectNext, 200)
      }
    )
  }


  db.get(
    'SELECT tournament_id FROM tournaments_raw WHERE fullData IS NULL LIMIT 1',
    [],
    requestResults
  )
}

selectNext();