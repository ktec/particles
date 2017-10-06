defmodule Heart do
  @moduledoc """
  Documentation for Heart.
  """

  alias Heart.BeatSupervisor

  def start(id) do
    BeatSupervisor.start(id)
  end

  def start(id, frequency) do
    BeatSupervisor.start(id, frequency)
  end

  def start(id, frequency, callback) do
    BeatSupervisor.start(id, frequency, callback)
  end

  def stop(id) do
    BeatSupervisor.stop(id)
  end
end
