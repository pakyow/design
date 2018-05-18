require "bundler/setup"

require "pakyow"
require "pakyow/all"

require "pakyow/integrations/bundler"
require "pakyow/integrations/dotenv"

Pakyow.configure do
  require "./config/application"

  config.data.connections.sql[:default] = ENV["DATABASE_URL"]
end
