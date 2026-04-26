import useChatStore from "../../store/useChatStore";
import Sidebar from "../../components/user/Sidebar";
import ChatContainer from "../../components/user/ChatContainer";
import NoChatSelected from "../../components/user/NoChatSelected";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="min-h-screen pt-16">
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        {selectedUser ? <ChatContainer /> : <NoChatSelected />}
      </div>
    </div>
  );
};

export default HomePage;
