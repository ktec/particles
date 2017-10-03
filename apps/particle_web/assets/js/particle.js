import {joinChannel} from "./channel"
import {Presence} from "phoenix"

// This is based heavily on MBostocks original work:
// https://bl.ocks.org/mbostock/9539958

// Pure functions...

// getPosition :: Int, Int, Int, Int -> {Int, Int}
const getPosition = (x0, y0, x1, y1) => {
  const x = x0 + (x1 - x0) * .25
  const y = y0 + (y1 - y0) * .25
  return {x,y}
}

// tau :: () -> Float
const τ = 2 * Math.PI
const radius = 200

// circleFactory :: Canvas, Colour, Position -> Function(Int)
const circleFactory = (context, {r,g,b}, {x, y}) => {
  return () => (time) => {
    context.strokeStyle = `rgba(${r},${g},${b},${1 - time})`
    context.beginPath()
    context.arc(x, y, radius * time, 0, τ)
    context.stroke()
  }
}

const hslMap = () => {
  const colours = {}
  for (var i = 0; i <= 360; i++) {
    colours[i] = d3.hsl(i, 1, .5).rgb()
  }
  return colours
}

// Here be dragons...
const init = (socket, root, id) => {
  // join the channel
  const channel = joinChannel(socket, id, "d3:particles", response => {
    console.log("Joined successfully", response)
    // response.map()
    let {user_id} = response
    id = user_id
  })

  const width = Math.max(700, innerWidth),
       height = Math.max(500, innerHeight)

  // some dirty global variables(!)
  let x1 = width / 2,
      y1 = height / 2,
      x0 = x1,
      y0 = y1,
      i = 0,
      presences = {}

  // add listener for channel messages
  channel.on("position", (response) => {
    let {id} = response
    presences[id] = response
  })

  // const updatePresences = (presences) => {
  //   console.log(presences)
  // }

  // handle presences
  channel.on("presence_state", state => {
    console.log("presence_state", state)
    // Presence.syncState(presences, state)
    // updatePresences(presences)
  })
  channel.on("presence_diff", diff => {
    const {leaves} = diff
    Object.keys(leaves).map((key) => {
      delete presences[key]
    })
    // Presence.syncDiff(presences, diff)
    // updatePresences(presences)
  })


  const colours = hslMap()

  // let d3 create the canvas and listen to mouse
  const canvas = d3.select(root).append("canvas")
      .attr("width", width)
      .attr("height", height)
      .on("ontouchstart" in document ? "touchmove" : "mousemove",
        function move() {
          const mouse = d3.mouse(this) // canvas
          x1 = mouse[0]
          y1 = mouse[1]
          const payload = {id, x0, y0, x1, y1, i}
          channel.push("position", payload)
          d3.event.preventDefault()
        }
      )

  const context = canvas.node().getContext("2d")
  context.globalCompositeOperation = "lighter"
  context.lineWidth = 2

  const renderFrame = () => {
    context.clearRect(0, 0, width, height)

    // const colour = d3.hsl(++i, 1, .5).rgb()
    const colour = colours[++i % 360]
    const pos = getPosition(x0, y0, x1, y1)
    const circle = circleFactory(context, colour, pos)
    x0 = pos.x
    y0 = pos.y

    d3.select({}).transition()
        .duration(1000)
        .ease(Math.sqrt)
        .tween("circle", circle)

    Object.keys(presences).map((key) => {
      if (key == id) { return }

      const {x0, y0, x1, y1, i} = presences[key]
      // const colour = d3.hsl(i, 1, .5).rgb()
      const colour = colours[i % 360]
      const pos = getPosition(x0, y0, x1, y1)
      const circle = circleFactory(context, colour, pos)

      d3.select({}).transition()
          .duration(500)
          .ease(Math.sqrt)
          .tween("circle", circle)
    })
  }

  d3.timer(renderFrame)

  // window.setInterval(renderFrame, 5)
}

export default {init: init}
