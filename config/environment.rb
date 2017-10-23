require "bundler/setup"
require "pakyow/integrations/bundler"
require "pakyow/integrations/dotenv"

require "./config/app"

Pakyow.configure do
  mount Pakyow::App, at: "/"
end
