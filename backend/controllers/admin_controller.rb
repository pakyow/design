controller :admin, "/admin" do
  action :require_admin

  def require_admin
    logger.debug "in require_admin"
  end
end
