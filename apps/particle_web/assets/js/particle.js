import {joinChannel} from "./channel"
import {Presence} from "phoenix"

// This is based heavily on MBostocks original work:
// https://bl.ocks.org/mbostock/9539958

// getPosition :: Int, Int, Int, Int -> {Int, Int}
const getPosition = (x0, y0, x1, y1) => {
  const x = x0 + (x1 - x0) * .25
  const y = y0 + (y1 - y0) * .25
  return {x,y}
}

// Hue Saturation Lightness Lookup table
// hslMap :: () -> Object
const hslMap = () => {
  const colours = {}
  for (var i = 0; i <= 360; i++) {
    colours[i] = d3.hsl(i, 1, .5).rgb()
  }
  return colours
}

// circleFactory :: Canvas, Colour, Position -> Function(Int) => Eff
const circleFactory = (context, {r,g,b}, {x, y}) => {
  const τ = 2 * Math.PI
  const radius = 200
  return () => (time) => {
    context.strokeStyle = `rgba(${r},${g},${b},${1 - time})`
    context.beginPath()
    context.arc(x, y, radius * time, 0, τ)
    context.stroke()
  }
}

// Here be dragons...
const init = (socket, root, id) => {

  const width = Math.max(700, innerWidth),
       height = Math.max(500, innerHeight)

  // some dirty global variables(!)
  const state = {
    id: id,
    user_id: null,
    x1: width / 2,
    y1: height / 2,
    x0: width / 2,
    y0: height / 2,
    i: 0,
    presences: {}
  }

  const channel = setUpChannel(socket, state, {id: id, fps: 60})

  const colours = hslMap()

  const mouseHandler = (mouse) => {
    state.x1 = mouse[0]
    state.y1 = mouse[1]
    let {id, x0, y0, x1, y1, i} = state
    const payload = {id, x0, y0, x1, y1, i}
    channel.push("position", payload)
  }

  // let d3 create the canvas and listen to mouse
  const canvas = d3.select(root).append("canvas")
      .attr("width", width)
      .attr("height", height)


  canvas.on("ontouchstart" in document ? "touchmove" : "mousemove",
    function move() {
      const mouse = d3.mouse(this) // this == canvas
      mouseHandler(mouse)
      d3.event.preventDefault()
    }
  )

  const context = canvas.node().getContext("2d")
  context.globalCompositeOperation = "lighter"
  context.lineWidth = 2

  const renderFrame = () => {
    context.clearRect(0, 0, width, height)

    // const colour = d3.hsl(++i, 1, .5).rgb()
    const colour = colours[++state.i % 360]
    const pos = getPosition(state.x0, state.y0, state.x1, state.y1)
    const circle = circleFactory(context, colour, pos)
    state.x0 = pos.x
    state.y0 = pos.y

    d3.select({}).transition()
        .duration(1000)
        .ease(Math.sqrt)
        .tween("circle", circle)

    Object.keys(state.presences).map((key) => {
      if (key == state.id) { return }

      const {x0, y0, x1, y1, i} = state.presences[key]
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

const setUpChannel = (socket, state, payload) => {
  // join the channel
  const channel = joinChannel(socket, {
    payload: payload,
    room: "d3:particles",
    success: response => {
      console.log("Joined successfully", response)
      let {user_id} = response
      state.id = user_id
    }
  })

  // add listener for various channel messages
  channel.on("position", (response) => {
    let {id} = response
    state.presences[id] = response
  })

  channel.on("positions", (response) => {
    Object.keys(response).map((key) => {
      const payload = response[key].metas[0]["position"]
      if (payload) { state.presences[key] = payload }
    })
  })

  // const updatePresences = (presences) => {
  //   console.log(presences)
  // }

  // handle presences
  channel.on("presence_state", state => {
    // console.log("presence_state", state)
    // Presence.syncState(presences, state)
    // updatePresences(presences)
  })

  channel.on("presence_diff", diff => {
    const {leaves} = diff
    Object.keys(leaves).map((key) => {
      delete state.presences[key]
    })
    // Presence.syncDiff(presences, diff)
    // updatePresences(presences)
  })

  return channel
}

export default {init: init}
