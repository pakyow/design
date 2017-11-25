view "/posts" do
  find(:post).present(posts)
end
