router "/" do
  default do
    redirect :post_list, as: 301
  end
end
