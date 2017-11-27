resource :post, "/posts" do
  list do
    presentable :posts, data.posts.all
  end

  create do
    verify do
      required :post do
        required :title do
          validate :presence
        end

        optional :body
        optional :published, :boolean
      end
    end

    data.posts.create(params[:post])
  end
end
