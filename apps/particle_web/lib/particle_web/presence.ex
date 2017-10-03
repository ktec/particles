defmodule ParticleWeb.Presence do
  use Phoenix.Presence, otp_app: :particle_web,
                        pubsub_server: ParticleWeb.PubSub
end
