defmodule Heart.BeatSupervisor do
  alias Heart.{Beat, BeatWorker}
  require Logger

  def start_link do
    import Supervisor.Spec, warn: false
    children = [
      worker(BeatWorker, [], [restart: :transient])
    ]
    opts = [strategy: :simple_one_for_one, max_restart: 0, name: __MODULE__]
    Supervisor.start_link(children, opts)
  end

  def start(id) do
    Supervisor.start_child(__MODULE__, [[id]])
  end

  def start(id, frequency) do
    Supervisor.start_child(__MODULE__, [[id, frequency]])
  end

  def start(id, frequency, callback) do
    Supervisor.start_child(__MODULE__, [[id, frequency, callback]])
  end

  def stop(id) when is_pid(id) do
    Supervisor.terminate_child(__MODULE__, id)
  end

  def stop(id) do
    Supervisor.terminate_child(__MODULE__, get_pid(id))
  end

  def get_pid(id) do
    :global.whereis_name(id)
  end

  # defp inspect_state({_, pid, _, _}), do: BeatWorker.inspect(pid)
end
