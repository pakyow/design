model :posts do
  primary_id
  timestamps

  attribute :title, :string
  attribute :body, :string
end
