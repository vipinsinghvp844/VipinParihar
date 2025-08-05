// WebSocketProvider.jsx
import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const WebSocketContext = createContext(null);

export const useSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socketInstance, setSocketInstance] = React.useState(null);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (userId) {
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
    }
  }, [userId]);

  return (
    <WebSocketContext.Provider value={socketInstance}>
      {children}
    </WebSocketContext.Provider>
  );
};

