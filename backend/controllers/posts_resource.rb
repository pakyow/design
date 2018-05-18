resources :posts, "/posts" do
  disable_protection :csrf

  list do
    expose :posts, data.posts.published
  end

  show do
    expose :post, data.posts.by_id(params[:post_id])
  end

  create do
    verify do
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

    data.posts.create(params[:post])
  end

  update do
    data.posts.by_id(params[:post_id]).update(title: "updated! #{Time.now}")
  end
end
