// API documentation https://www.ifpapinball.com/api/documentation/tournament/
const fs = require('fs')
const request = require('request')
const sqlite3 = require('sqlite3')
require('dotenv').config()

const db = new sqlite3.Database(`${__dirname}/../data.sqlite3`)

const IFPAKEY = process.env.IFPAKEY

const listAmount = 250
const api = 'https://api.ifpapinball.com/v1/'

const minYear = 2009
let allDone = false

let totalOffset = 0
let numAlreadyInserted = 0
let numNew = 0
let numRemainingInList = 0
function getList(offset=0) {
  const listApi = `${api}tournament/list?start_pos=${offset}&count=${listAmount}&api_key=${IFPAKEY}`
  request(listApi, (error, response, body) => {
    if (error) {
      console.log(error)
      retry()
      return
    }
    let data = null
    try {
      data = JSON.parse(body)
    } catch (e) {
      return retry()
    }
    numRemainingInList = data.tournament.length
    data.tournament.forEach(tournament => {
      if (tournament.event_date && tournament.event_date.indexOf(minYear) !== -1) {
        allDone = true
      }
      const insertTournament = () => {
        db.run(
          'INSERT INTO tournaments_raw (tournament_id, listData) VALUES (?, ?)',
          tournament.tournament_id,
          JSON.stringify(tournament),
          () => {
            numNew ++
            listItemDone()
          }
        )
      }
      const checkCount = (error, count) => {
        if (error) throw error
        if (count.count == 0) {
          insertTournament()
        } else {
          numAlreadyInserted ++
          listItemDone()
        }
      }
      db.get(
        'SELECT COUNT(*) as count FROM tournaments_raw WHERE tournament_id=?',
        tournament.tournament_id,
        checkCount
      )
    })
  })
}

function listItemDone() {
  numRemainingInList --
  if (numRemainingInList === 0) {
    console.log(`num new ${numNew}, old ${numAlreadyInserted}`)
    if (!allDone) {
      setTimeout(() => {
        totalOffset += listAmount
        getList(totalOffset)
      }, 5000)
    } else {
      db.close()
    }
  }
}

function retry() {
  console.log('error occured with request, retrying in 30 seconds')
  setTimeout(() => {
    getList(totalOffset)
  }, 30000)
}

getList(totalOffset)