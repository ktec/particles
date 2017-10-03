defmodule ParticleWeb.PageController do
  use ParticleWeb, :controller
  alias ParticleWeb.Session

  def index(conn, _params) do
    render conn, "index.html", %{token: Session.token(conn)}
  end
end
