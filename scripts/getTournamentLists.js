// API documentation https://www.ifpapinball.com/api/documentation/tournament/
const fs = require('fs')
const request = require('request')
require('dotenv').config()

const IFPAKEY = process.env.IFPAKEY

const listAmount = 250
const api = 'https://api.ifpapinball.com/v1/'

function getList(offset=0) {
  const listApi = `${api}tournament/list?start_pos=${offset}&count=${listAmount}&api_key=${IFPAKEY}`
  request(listApi, (error, response, body) => {
    if (error) throw error
    const data = JSON.parse(body)
    data.tournament.forEach(tournament => {

    })
  })
}

getList()