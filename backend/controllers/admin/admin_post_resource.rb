extend_controller :admin do
  resources :posts, "/posts" do
    list do
      logger.debug "in admin list"
    end
  end
end
