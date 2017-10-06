defmodule Heart.Beat do
  defstruct [
    id: nil,
    frequency: 1000, # every second
    callback: nil
  ]
end
