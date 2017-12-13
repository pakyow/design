controller :admin, "/admin" do
  before :require_admin

  def require_admin
    logger.debug "in require_admin"
  end
end
