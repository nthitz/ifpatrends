const sqlite3 = require('sqlite3')
const moment = require('moment')

const locationHash = require('../utils/locationHash')
const db = new sqlite3.Database(`${__dirname}/../data.sqlite3`)
const tournaments = []
const historicalResults = []

selectTournaments()

/* starting from zero takes like 10-20 minutes so uh use with caution */

/* be careful!
// clearExisting()

// function clearExisting() {
//   db.run(
//     'DELETE FROM tournaments',
//     [],
//     () => {
//       db.run('DELETE FROM player_history', [], selectTournaments)
//     }
//   )
// }

*/

function selectTournaments() {
  db.each(
    'SELECT * FROM tournaments_raw',
    [],
    (error, row) => {
      if (error) throw error
      const listData = JSON.parse(row.listData)
      const fullData = JSON.parse(row.fullData)
      const resultData = JSON.parse(row.resultData)
      if (!fullData || !resultData) {
        console.log('skipping probably incomplete', row)
        return
      }
      const tournament_id = row.tournament_id
      let total_wpprs = 0
      let results = []
      // console.log(listData, fullData, resultData, tournament_id)
      if (resultData.results) {
        total_wpprs = resultData.results.reduce(
          (sum, player) => {
            return sum + parseInt(player.points, 10)
          },
          0
        )
        results = resultData.results.map(
          (player) => {
            return {
              tournament_id,
              date: moment(resultData.event_date, 'YYYY-MM-DD').valueOf(),
              player_id: player.player_id,
              position: player.position,
              rank: player.wppr_rank,
              rating: player.ratings_value,
              points: player.points,
            }
          }
        )
      }
      const tournament = {
        tournament_id,
        name: listData.tournament_name,
        event_name: listData.event_name,
        date: listData.event_date,
        player_count: listData.player_count,
        tournament_type: fullData.tournament_type,
        periodic_count: resultData.periodic_count,
        rating_strength: resultData.rating_strength,
        ranking_strength: resultData.ranking_strength,
        base_value: resultData.base_value,
        event_value: resultData.event_value,
        total_wpprs,
      }
      const location = {
        country_code: listData.country_code,
        country_name: fullData.country_name,
        state: fullData.state,
        city: fullData.city,
      }
      tournament.location_hash = locationHash(location)
      tournaments.push({tournament, results})
    },
    (error, rowCount) => {
      if (error) throw error
      insertTournaments(tournaments)
    }
  )
}

function insertTournaments(locationMap) {
  tournaments.forEach(_tournament => {
    const tournament = _tournament.tournament
    const insertTournament = () => {
      db.run(
        `INSERT INTO tournaments
          (tournament_id, name, event_name, date, player_count,
            tournament_type, periodic_count, rating_strength, ranking_strength,
            base_value, event_value, total_wpprs, location_hash)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tournament.tournament_id, tournament.name, tournament.event_name,
          tournament.date, tournament.player_count,  tournament.tournament_type,
          tournament.periodic_count, tournament.rating_strength,  tournament.ranking_strength,
          tournament.base_value, tournament.event_value,  tournament.total_wpprs,
          tournament.location_hash],
        checkIfTournamentsDone
      )
    }
    const checkCount = (error, result) => {
      if (error) throw error
      if (result.count == 0) {
        insertTournament()
        historicalResults.push(_tournament.results)
      } else {
        checkIfTournamentsDone()
      }
    }
    const queryIfExists = () => {
      db.get(
        'SELECT COUNT(*) as count FROM tournaments WHERE tournament_id=?',
        [tournament.tournament_id],
        checkCount
      )
    }
    queryIfExists()
  })
}
let numDone = 0
function checkIfTournamentsDone(error) {
  if (error) throw error
  numDone ++
  console.log('touranments done: ', numDone, tournaments.length)
  if (numDone === tournaments.length) {
    insertResults()
    console.log('tournaments done')
  }
}

function insertResults() {
  historicalResults.forEach(result => {
    db.run(
      `INSERT INTO player_history
        (tournament_id, player_id, position, rank, rating, points, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        result.tournament_id, result.player_id,
        result.position, result.rank, result.rating,
        result.points, result.date
      ],
      checkIfResultsDone
    )
  })

}

let resultsDone = 0
function checkIfResultsDone(error) {
  if(error) throw error
  resultsDone ++
  console.log('results done: ', resultsDone, historicalResults.length)
  if(resultsDone === historicalResults.length) {
    db.close()
    console.log('all done')
  }
}