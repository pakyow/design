view "/posts" do
  find(:post).present(posts_data)
end

view "/posts/show" do
  find(:post).present(post)
end
