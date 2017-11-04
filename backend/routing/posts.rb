resource "/posts" do
  list do
    # queries return a query context that must be executed (e.g. by the view)
    presentable :posts, posts.all
  end

  create do
    # validate and sanitize params; raises ValidationError if failure occurs
    validate do # helper for `request.validate`
      required :post do
        required :title
        optional :body
      end
    end

    posts.create(params[:post]) # helper for `data[:posts]`
  end
end
