import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";

const WebSocketContext = createContext(null);

export const useSocket = () => useContext(WebSocketContext);

export const useSocketActions = () => {
  const socket = useContext(WebSocketContext);
  const userId = localStorage.getItem("user_id");

  const emitLogout = () => {
    if (socket && userId) {
      socket.emit("user-offline", userId);
      socket.disconnect();
    }
  };

  return { emitLogout };
};

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socketInstance, setSocketInstance] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("user_id")); // 👈 Reactive

  // 👇 Track localStorage changes like login/logout
  useEffect(() => {
    const handleStorageChange = () => {
      const newUserId = localStorage.getItem("user_id");
      setUserId(newUserId);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 👇 Socket connect only when userId is available
  useEffect(() => {
    if (!userId) return;

    const socket = io("http://localhost:3000", {
      query: { userId },
    });

    socket.emit("user-online", userId);

    socketRef.current = socket;
    setSocketInstance(socket);

    const handleBeforeUnload = () => {
      socket.emit("user-offline", userId);
      socket.disconnect();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.emit("user-offline", userId);
      socket.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId]);

  return (
    <WebSocketContext.Provider value={socketInstance}>
      {children}
    </WebSocketContext.Provider>
  );
};
