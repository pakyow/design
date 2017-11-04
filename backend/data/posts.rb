# options passed to the adapter; both are optional in
# this case, but needed with multiple connections
data adapter: :sql, connection: :default do
  timestamps

  attribute :title, String
  attribute :body,  String

  def by_id(id)
    where(id: id)
  end
end
