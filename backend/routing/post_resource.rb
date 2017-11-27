resource :post, "/posts" do
  list do
    presentable :posts, data.posts.all
  end

  verify :create do
    required :post do
      required :title do
        validate :presence
      end

      optional :body
      optional :published, :boolean
    end
  end

  create do
    data.posts.create(params[:post])
  end
end
