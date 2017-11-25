resource :post, "/posts" do
  list do
    presentable :posts, data.posts.all
  end

  create do
    verify do
      required :post do
        optional :title
        required :body
      end
    end

    data.posts.create(params[:post])
  end
end
