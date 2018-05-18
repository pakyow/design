controller :home, "/" do
  default do
    redirect :posts_list, as: 301
  end
end
