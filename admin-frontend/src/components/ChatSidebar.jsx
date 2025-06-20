import React, { useEffect, useState, useRef, useContext } from "react";
import { ListGroup } from "react-bootstrap";
import { format } from "date-fns";
import { WebSocketContext } from "./WebSocketContext";
import { useSelector } from "react-redux";

function ChatSidebar({
  selectUser,
  filteredUsers,
  searchItem,
  handleInputChange,
  getProfileImage,
  // getLastMessageForUser,
}) {
 
  const { userStatus } = useContext(WebSocketContext);
  const [active, setActive] = useState(false);
    const { TotalNotifications, AllUnseenUserAndMessages } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );

  return (
    <div className="sidebare">
      <div>
        <input
          type="text"
          className="p-2 mb-2"
          value={searchItem}
          onChange={handleInputChange}
          placeholder="Type to Search User"
          style={{ width: "100%", borderRadius: "15px" }}
        />
      </div>
      <ListGroup style={{ height: "500px", overflowY: "auto", overflowX:"hidden" }}>
        {filteredUsers.map((user) => {
          const unseenMessages =
            AllUnseenUserAndMessages?.[0]?.unread_messages?.find(
              (msg) => String(msg.sender_id) === String(user.id) 
            )?.unread_count || 0;
          const isOnline = userStatus[String(user.id)]?.status === "online";
          // console.log(isOnline,"jhckjsdkjdhfkhds");
          

          return (
            <ListGroup.Item
              key={user.id}
              onClick={() => selectUser(user)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={getProfileImage(user.id)}
                  alt="Profile"
                  className="popup-profile-image"
                  style={{
                    width: "40px",
                    height: "40px",
                    marginRight: "10px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
                {/* Online/Offline Status Dot */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: isOnline ? "green" : "gray",
                    border: "2px solid white",
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: "bold" }}>{user.username}</div>
              </div>
              {unseenMessages > 0 && (
                <span
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    fontSize: "0.8em",
                    padding: "4px 7px",
                    borderRadius: "50%",
                   }}
                >
                  {unseenMessages}
                </span>
              )}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
}

export default ChatSidebar;
