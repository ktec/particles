defmodule ParticleWeb.Session do
  use ParticleWeb, :controller
  alias ParticleWeb.Endpoint

  def token(conn) do
    Phoenix.Token.sign(Endpoint, "token", session_uuid(conn))
  end

  def session_uuid(conn) do
    case get_session(conn, :player_uuid) do
      nil ->
        uuid = UUID.uuid4
        put_session(conn, :player_uuid, uuid)
        uuid
      existing_uuid -> existing_uuid
    end
  end
end
