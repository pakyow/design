require "bundler/setup"

require "pakyow"
require "pakyow/all"

require "pakyow/integrations/bundler"
require "pakyow/integrations/dotenv"

require "./config/application"

Pakyow.configure do
  config.connections.sql[:default] = ENV["DATABASE_URL"]
end
