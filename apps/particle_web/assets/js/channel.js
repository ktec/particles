const successHandler = response =>
  console.log("Joined successfully", response)

const errorHandler = response =>
  console.log("Unable to join", response)

export const joinChannel = (socket, {payload, room, success, error}) => {
  console.log(`Joining ${room}`)
  let channel = socket.channel(`${room}`, payload)
  channel.join()
    .receive("ok", success || successHandler)
    .receive("error", error || errorHandler)
  return channel
}
