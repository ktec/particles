defmodule Heart.BeatWorker do
  use GenServer

  import Logger
  alias Heart.Beat

  ### PUBLIC API ###

  def inspect_state(pid) do
    GenServer.call(pid, :inspect_state)
  end

  def start_link([id]) do
    state = %Beat{
      id: id,
      callback: fn() -> IO.puts "Heart Beat" end
    }
    GenServer.start_link(__MODULE__, state, [name: {:global, id}])
  end

  def start_link([id, frequency]) do
    state = %Beat{
      id: id,
      frequency: frequency,
      callback: fn() -> IO.puts "Heart Beat" end
    }
    GenServer.start_link(__MODULE__, state, [name: {:global, id}])
  end

  def start_link([id, frequency, callback]) do
    state = %Beat{
      id: id,
      frequency: frequency,
      callback: callback
    }
    GenServer.start_link(__MODULE__, state, [name: {:global, id}])
  end

  # def start_link([id, frequency, callback]) do
  #   Logger.debug "We got here...start_link #{frequency}"
  #   GenServer.start_link(__MODULE__, [frequency], [name: {:global, "#{__MODULE__}" <> id}])
  # end

  ### GENSERVER CALLBACKS ###

  def init(%Beat{} = state) do
    Logger.debug "BeatWorker.init #{state.frequency}"
    schedule_beat(state)
    {:ok, state}
  end

  def handle_info(:beat, state) do
    Logger.debug "BeatWorker.handle_info #{inspect state}"
    do_beat(state)
    schedule_beat(state)
    {:noreply, state}
  end

  defp do_beat(%{callback: callback} = state) when is_function(callback) do
    # This is where we need to do some real magic.
    Logger.debug "BeatWorker.do_beat"
    state.callback.()
    state
  end

  defp do_beat(state) do
    Logger.debug "BeatWorker.do_beat - maybe callback is mfa?"
    state
  end

  defp schedule_beat(state) do
    Logger.debug "BeatWorker.schedule_beat #{state.frequency}"
    Process.send_after(self(), :beat, state.frequency)
  end
end
