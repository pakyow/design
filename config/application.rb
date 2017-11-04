require "pakyow/core"

Pakyow::App.define do
  configure do
    config.app.name = "design"

    config.data.adapter :sql do
      connection :default, ENV["DATABASE_URL"]
    end
  end

  configure :development do
  end
end
