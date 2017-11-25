require "bundler/setup"
require "pakyow/integrations/bundler"
require "pakyow/integrations/dotenv"

require "./config/application"

Pakyow.configure do
  config.connections.sql[:default] = ENV["DATABASE_URL"]

  mount Pakyow::App, at: "/"
end
