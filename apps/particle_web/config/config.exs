# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :particle_web,
  namespace: ParticleWeb,
  ecto_repos: [ParticleWeb.Repo]

# Configures the endpoint
config :particle_web, ParticleWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "jgqOtp5DZhuOfqBly0kOdLP2hk4hKA9VvOV9Fse0kUfdONoR+71SBB4UcpRstnPh",
  render_errors: [view: ParticleWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: ParticleWeb.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :particle_web, :generators,
  context_app: false

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
