import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import request from 'superagent'
import moment from 'moment'

import "../node_modules/react-vis/dist/style.css";
import Graph from './Graph'
import {nest} from 'd3-collection'

const API_PORT = 4000
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ifpanumbers: '44733, 35784',
      data: null,
      rank: true,
      rating: true,
    }
  }

  _input = (event) => {
    console.log(event.target.value)
    this.setState({
      ifpanumbers: event.target.value
    })
  }

  _toggle = (key) => {
    return () => {
      this.setState({[key]: !this.state[key]})
    }
  }


  _getData = () => {
    const matchNumbers = /(\d+)/g
    const ids = this.state.ifpanumbers.match(matchNumbers)
      .map(d => parseInt(d, 10))

    const uri = `http://${document.location.hostname}:${API_PORT}/getPlayerData`
    request.post(uri)
      .send({ids})
      .end((error, result) => {
        if (error) throw error
        result.body.forEach(d => {
          d.date = moment(parseInt(d.date, 10))
        })
        const nested = nest()
          .key(d => d.player_id)
          .entries(result.body)
        this.setState({data: result.body, nested})
      })

  }

  render() {
    const errors = []
    let graph = null
    if (this.state.data) {
      graph = <Graph {...this.state} />
    }
    return (
      <div className="App">
        Enter some IFPA numbers: <br />
        <input onChange={this._input} value={this.state.ifpanumbers} />
        <input type='button' onClick={this._getData} value='graph' />
        <div>
          Show Rating:
          <input
            type="checkbox"
            checked={this.state.rating}
            onChange={this._toggle('rating')}
            style={{marginRight: '2em'}}
          />
          Rank:
          <input
            type="checkbox"
            checked={this.state.rank}
            onChange={this._toggle('rank')}
          />

        </div>
        {errors}

        {graph}
      </div>
    );
  }
}

export default App;
