view "/posts" do
  find(:post).present(posts)
end

view "/posts/show" do
  find(:post).present(post)
end
