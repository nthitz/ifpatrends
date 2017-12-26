import React from 'react'

import {scaleTime, scaleLinear, scaleOrdinal, schemeCategory10} from 'd3-scale'
import {extent} from 'd3-array'
import {line} from 'd3-shape'
import {axisLeft, axisBottom, axisRight} from 'd3-axis'
import {select} from 'd3-selection'
const metrics = ['rating', 'rank']

const strokeDashes = {
  rank: null,
  rating: '3, 3'
}

let _xAxis = null

export default class Graph extends React.Component {
  componentDidMount() {
    this._drawAxes()
  }

  componentDidUpdate() {
    this._drawAxes()
  }

  _drawAxes = () => {
    select(this._xAxisGroup)
      .call(this._xAxisGenerator)
    select(this._ratingAxisGroup)
      .call(this._yAxisGenerators[0])
    select(this._rankAxisGroup)
      .call(this._yAxisGenerators[1])

  }

  render() {
    const {props} = this
    const width = window.innerWidth * 0.8
    const height = 500
    const margins = {left: 50, top: 5, right: 50, bottom: 50}

    const xExtent = extent(props.data, (d) => +d.date.valueOf())
    const yExtents = metrics.map(metric => {
      return extent(props.data, (d) => +d[metric])
    })

    const xScale = scaleTime()
      .domain(xExtent)
      .range([0, width])
    const yScales = yExtents.map((extent, i) => {
      return scaleLinear()
        .domain(extent)
        .range([height, 0])
    })
    const colors = scaleOrdinal()
      .range(schemeCategory10)

    const players = props.nested.map(player => {
      const lines = metrics.map((metric, i) => {
        if (!props[metric]) {
          return null
        }
        const yScale = yScales[i]
        const lineGen = line()
          .x(d => xScale(d.date.valueOf()))
          .y(d => yScale(d[metric]))
        const filteredData = player.values.filter(d => !isNaN(d[metric]))
        const stroke = colors(player.key)
        const strokeDash = strokeDashes[metric]
        return (
          <path
            key={metric}
            d={lineGen(filteredData)}
            stroke={stroke}
            strokeDasharray={strokeDash}
          />
        )
      })
      return <g key={player.key}>{lines}</g>
    })

    this._xScale = xScale
    this._yScales = yScales

    this._xAxisGenerator = axisBottom(this._xScale)
    this._yAxisGenerators = metrics.map((metric, i) => {
      return (i === 0 ? axisLeft : axisRight)(yScales[i])
    })

    const playerLegend = (
      <text y={40}>
      {props.nested.map(player => {
        const fill = colors(player.key)
        return <tspan key={player.key} fill={fill}>{player.key} </tspan>
      })}
      </text>
    )
    return (
      <div>
        <svg
          width={width + margins.left + margins.right}
          height={height + margins.top + margins.bottom}
        >
          <g transform={`translate(${margins.left}, ${margins.top})`}>
            {players}
            <g transform={`translate(0, ${height})`}>{playerLegend}</g>
            <g
              ref={c => this._xAxisGroup = c}
              transform={`translate(0, ${height})`}
            />
            <g
              className='ratingAxis'
              opacity={props.rating ? 1 : 0}
              ref={c => this._ratingAxisGroup = c}
            />
            <g
              className='rankAxis'
              opacity={props.rank ? 1 : 0}
              ref={c => this._rankAxisGroup = c}
              transform={`translate(${width}, 0)`}
            />

          </g>
        </svg>
      </div>

    )
  }
}
