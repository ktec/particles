defmodule ParticleWeb.D3Channel do
  use Phoenix.Channel
  alias ParticleWeb.Presence

  def join("d3:particles", _payload, %{assigns: %{user_id: verified_user_id}} = socket) do
    send(self(), :after_join)
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

  def handle_in("position", payload, socket) do
    broadcast_from socket, "position", payload
    {:noreply, socket}
  end
end
