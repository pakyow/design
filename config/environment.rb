require "bundler/setup"
require "pakyow/integrations/bundler"
require "pakyow/integrations/dotenv"

require "./config/application"

Pakyow.configure do
  mount Pakyow::App, at: "/"
end
