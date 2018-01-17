source "https://rubygems.org"

gem "pakyow", github: "pakyow/pakyow", branch: "master"

# app server
gem "puma", platforms: :ruby
gem "thin", platforms: :mswin

# use dotenv to load environment variables
gem "dotenv"

group :test do
  gem "rspec"
end

gem "pg"

# TODO: things go south when this is commented out; can we catch these and provide instructions to the user?
gem "sass"
