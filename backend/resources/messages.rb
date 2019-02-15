resource :messages, "/messages" do
  create do
    verify do
      required :message do
        required :content do
          validate :presence
        end
      end
    end

    data.messages.create(params[:message])

    redirect connection.form[:origin]
  end
end
