Pakyow.configure do
  config.data.connections.sql[:default] = ENV["DATABASE_URL"]
end

Pakyow.configure :production do
end
