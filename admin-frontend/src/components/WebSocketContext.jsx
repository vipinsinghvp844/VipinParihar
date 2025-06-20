import React, { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [userStatus, setUserStatus] = useState({});
  const socketRef = useRef(null);
  const userId = localStorage.getItem("user_id");

  // Connect WebSocket and manage user status
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = new WebSocket("wss://testing-vipin.onrender.com");
      // socketRef.current = new WebSocket("ws://localhost:8080");

      socketRef.current.onopen = () => {
        // console.log("Connected to WebSocket Server");

        // Notify server that the user is online
        socketRef.current.send(JSON.stringify({ type: "user_online", userId }));

        setUserStatus((prev) => ({
          ...prev,
          [userId]: { status: "online", lastUpdated: new Date().toISOString() },
        }));

        updateUserStatusInDB(userId, "online");
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "user_status_update") {
            // console.log("Status update received:", data);
            setUserStatus((prev) => ({
              ...prev,
              [data.userId]: {
                status: data.status,
                lastUpdated: data.lastUpdated,
              },
            }));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socketRef.current.onclose = () => {
        // console.log("Disconnected from WebSocket Server");

        setUserStatus((prev) => ({
          ...prev,
          [userId]: {
            status: "offline",
            lastUpdated: new Date().toISOString(),
          },
        }));

        updateUserStatusInDB(userId, "offline");
      };
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [userId]);

  // Fetch all users' statuses from the server
  useEffect(() => {
    const fetchAllStatuses = async () => {
      try {
        const authtoken = localStorage.getItem("authtoken");
        const response = await axios.get(
          `${import.meta.env.VITE_API_ON_OFF_ALL_USER_STATUS}`,
          { headers: { Authorization: `Bearer ${authtoken}` } }
        );
// console.log(response.data);

        // const statuses = response.data.reduce((acc, user) => {
        //   acc[user.user_id] = {
        //     status: user.status,
        //     lastUpdated: user.lastUpdated,
        //   };
        //   return acc;
        // }, {});

        setUserStatus(response.data);
      } catch (error) {
        console.error("Error fetching all user statuses:", error);
      }
    };

    fetchAllStatuses();
  }, []);
// console.log(userStatus);

  // Update user status in the database
  const updateUserStatusInDB = (userId, status) => {
    const authtoken = localStorage.getItem("authtoken");
    if (authtoken) {
      if (userId) {
        axios
          .post(
            `${import.meta.env.VITE_API_ON_OFF_USER_STATUS}`,
            { user_id: userId, status },
            { headers: { Authorization: `Bearer ${authtoken}` } }
          )
          .then((response) =>
            console.log(`${status} status updated:`, response.data)
          )
          .catch((error) =>
            console.error(`Error updating ${status} status:`, error)
          );
      }
    } };

  return (
    <WebSocketContext.Provider value={{ userStatus, socketRef }}>
      {children}
    </WebSocketContext.Provider>
  );
};
