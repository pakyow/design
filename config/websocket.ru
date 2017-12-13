require "bundler/setup"

require "pakyow"
require "pakyow/all"

require "pakyow/integrations/bundler"
require "pakyow/integrations/dotenv"

# NOTE: it's important that it has the same name as the app, so sessions and redis keys line up.
Pakyow.app :design, only: [:realtime]
run Pakyow.setup(env: ENV["RACK_ENV"]).to_app
