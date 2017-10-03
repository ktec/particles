// import socket from "./socket"
import particle from "./particle"
import {Socket} from "phoenix"

// const hash = window.location.hash.substr(1)
const token = document.head.querySelector("[name=token]").content
const socket = new Socket("/socket", {params: {token: token}})
socket.connect()

particle.init(socket, "#particles", token)
