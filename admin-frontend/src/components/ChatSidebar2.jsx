import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { ListGroup } from "react-bootstrap";

const ChatSidebar2 = ({ setSelectedUser, getProfileImage, users }) => {
  const [searchItem, setSearchItem] = useState("");

  //Search ke liye input
  const handleInputChange = (e) => {
    setSearchItem(e.target.value);
  };
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchItem.toLowerCase())
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
      <ListGroup
        style={{ height: "500px", overflowY: "auto", overflowX: "hidden" }}
      >
        {filteredUsers.map((user) => (
          <ListGroup.Item
            key={user._id}
            onClick={() => setSelectedUser(user)}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={getProfileImage(user._id) || "/default-avatar.png"}
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
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "isOnline" ? "green" : "gray",
                  border: "2px solid white",
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: "bold" }}>{user.username}</div>
            </div>
            <span
              style={{
                backgroundColor: "red",
                color: "white",
                fontSize: "0.8em",
                padding: "4px 7px",
                borderRadius: "50%",
              }}
            >
              {"unseenMessages"}
            </span>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};
export default ChatSidebar2;
