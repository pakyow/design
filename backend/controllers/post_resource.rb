resource :post, "/posts" do
  list do
    expose :posts, data.posts.published
  end

  verify :create do
    required :post do
      required :title do
        validate :presence
      end

      optional :published, :boolean
    end
  end

  handle InvalidData, as: :bad_request do
    logger.error "errored fields: #{req.error.verifier.errors.inspect}"
    logger.error "messages: #{req.error.verifier.messages.inspect}"
  end

  show do
    presentable :post, data.posts.by_id(params[:post_id])
  end

  create do
    data.posts.create(title: Time.now.to_s, published: true)
  end

  update do
    data.posts.by_id(params[:post_id]).update(title: "updated! #{Time.now}")
  end
end
