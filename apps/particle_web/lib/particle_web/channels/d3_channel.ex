defmodule ParticleWeb.D3Channel do
  use Phoenix.Channel
  alias ParticleWeb.Presence

  def join("d3:particles", payload, %{assigns: %{user_id: verified_user_id}} = socket) do
    send(self(), :after_join)
    interval = fps_to_interval(payload["fps"])
    :timer.send_interval(interval, :tick)
    {:ok, %{user_id: verified_user_id}, socket}
  end

  def join("d3:particles", _payload, socket) do
    {:ok, %{error: "Token verification failed"}, socket}
  end

  def handle_info(:after_join, socket) do
    push socket, "presence_state", Presence.list(socket)
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:seconds))
    })
    {:noreply, socket}
  end

  def handle_info(:tick, socket) do
    push socket, "positions", Presence.list(socket)
    {:noreply, socket}
  end

  def handle_in("position", payload, socket) do
    {:ok, _} = Presence.update(socket, socket.assigns.user_id, %{
      position: payload
    })
    {:noreply, socket}
  end

  # 60000 = ONE_MINUTE
  # 60000 / 60 = 1000 = ONE_SECOND
  # 60 fps = 1000/60 = 16.6666666667
  defp fps_to_interval(fps) do
    round(1000 / fps)
  end
end
