router "/admin", before: [:require_admin] do
  def require_admin
  end

  # everything in routes/admin will be loaded within this router
end
