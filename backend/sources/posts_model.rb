source :posts do
  primary_id
  timestamps

  attribute :title, :string
  attribute :published, :boolean

  subscribe :published, published: true

  def published
    where(published: true)
  end
end
