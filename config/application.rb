require "pakyow/core"
require "pakyow/presenter"
require "pakyow/data"

Pakyow::App.define do
  include Pakyow::Presenter

  configure do
    config.app.name = "design"
  end

  configure :development do
  end
end
