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

  handle InvalidData, as: :bad_request do
    logger.error "errored fields: #{req.error.verifier.errors.inspect}"
    logger.error "messages: #{req.error.verifier.messages.inspect}"
  end

  create do
    data.posts.create(params[:post])
  end
end
