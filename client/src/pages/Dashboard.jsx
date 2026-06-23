import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms/my-rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const createRoom = async () => {
    try {
      const res = await api.post(
        "/rooms/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/chat/${res.data.roomId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const joinRoom = () => {
    if (!roomId.trim()) return;
    navigate(`/chat/${roomId}`);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and join your chat rooms</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>

        {/* Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create Room Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Start a New Conversation</h3>
              <p className="text-sm text-gray-500 mt-1">Create a fresh room and invite others.</p>
            </div>
            <button
              onClick={createRoom}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Room
            </button>
          </div>

          {/* Join Room Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Join Existing Room</h3>
              <p className="text-sm text-gray-500 mt-1">Enter a room ID to hop directly into a chat.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. room-123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
              <button
                onClick={joinRoom}
                disabled={!roomId.trim()}
                className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Rooms List Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            My Recent Rooms
          </h2>

          {rooms.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">No rooms found. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => navigate(`/chat/${room.roomId}`)}
                  className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <span className="text-indigo-600 font-medium text-xs">#</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 truncate transition-colors">
                      {room.roomId}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default Dashboard;