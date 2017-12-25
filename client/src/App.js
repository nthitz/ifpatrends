import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import request from 'superagent'
import moment from 'moment'

import "../node_modules/react-vis/dist/style.css";
import Graph from './Graph'

const API_PORT = 4000
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ifpanumbers: '44733, 35784',
      data: null,
    }
  }

  _input = (event) => {
    console.log(event.target.value)
    this.setState({
      ifpanumbers: event.target.value
    })
  }

  _getData = () => {
    let nan = false
    const ids = this.state.ifpanumbers.split(',').map(v => {
      const result = parseInt(v.trim(), 10)
      if (isNaN(result)) nan = true
      return result
    })
    console.log(ids)
    if (nan) {
      this.setState({invalidValue: true})
      return
    }
    this.setState({invalidValue: false})
    const uri = `http://${document.location.hostname}:${API_PORT}/getPlayerData`
    request.post(uri)
      .send({ids})
      .end((error, result) => {
        if (error) throw error
        console.log(result)
        this.setState({data: result.body.map(d => {
          d.date = moment(d.date)
          return d
        })})
      })

  }

  render() {
    const errors = []
    if (this.state.invalidValue) {
      errors.push(<div>One of the ifpa numbers you entered appears invalid</div>)
    }
    let graph = null
    if (this.state.data) {
      graph = <Graph data={this.state.data} />
    }
    return (
      <div className="App">
        Enter some IFPA numbers: <br />
        <input onChange={this._input} value={this.state.ifpanumbers} />
        <input type='button' onClick={this._getData} value='graph' />
        {errors}

        {graph}
      </div>
    );
  }
}

export default App;
