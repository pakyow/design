extend_controller :admin do
  resource :post, "/posts" do
    list do
      logger.debug "in admin list"
    end
  end
end
