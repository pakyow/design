component :chat do
  def perform
    expose :messages, data.messages.all
  end
end
