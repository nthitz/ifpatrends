import React from 'react'

import {scaleLinear} from 'd3-scale'
import {nest} from 'd3-collection'
import {extent} from 'd3-array'
import {line} from 'd3-shape'
const metrics = ['rating', 'rank']

export default function Graph(props) {
  const width = 500
  const height = 500
  const margins = {left: 5, top: 5, right: 5, bottom: 5}

  const yExtents = metrics.map(metric => {
    return extent(props.data, (d) => +d[metric])
  })
  console.log(yExtents)
  const xExtent = extent(props.data, (d) => +d.date)

  // console.log(xExtent, ratingExtent)
  return (
    <svg
      width={width + margins.left + margins.right}
      height={height + margins.top + margins.bottom}
    >
      <g transform={`translate(${margins.left}, ${margins.top})`}>

      </g>
    </svg>

  )
}
