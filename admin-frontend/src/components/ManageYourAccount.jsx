import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  Spinner,
  Modal,
  Button,
} from "react-bootstrap";
import { FaCamera } from "react-icons/fa";
import Cropper from "react-easy-crop";
import PersonalInfo from "./PersonalInfo";
import ChangePassword from "./auth/ChangePassword";
import "./ManageYourAccount.css";
import { useDispatch, useSelector } from "react-redux";
import {
  ProfilePicUpdateAction,
  ProfilePicUploadAction,
} from "../../redux/actions/dev-aditya-action";
import getCroppedImg from "./utils/cropImageHelper.jsx";
import axios from "axios";

const ManageYourAccount = () => {
  const [profileImage, setProfileImage] = useState("");
  const { loginUserProfile, loginUserData } = useSelector(
    ({ AllReducers }) => AllReducers
  );
  const dispatch = useDispatch();
  const placeholderImage = import.meta.env.VITE_PLACEHOLDER_IMAGE;
  const [activeTab, setActiveTab] = useState("Personal Info");
  const user_name = localStorage.getItem("user_name");

  const [loading, setLoading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setShowCropModal(true);
      };
    }
  };
  const handleCropConfirm = async (event) => {
    setLoading(true);
    const base64Image = await getCroppedImg(selectedImage, croppedAreaPixels);
    setShowCropModal(false);
    if (!loginUserProfile) {
      const response = await dispatch(ProfilePicUploadAction(base64Image));
      if (response?.data) {
        setLoading(false);
      }
    } else {
      const response = await dispatch(ProfilePicUpdateAction(base64Image));
      if (response?.data) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Personal Info":
        return <PersonalInfo />;
      case "Change Password":
        return <ChangePassword />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <>
      <Container>
        <Row>
          <Col className="coverimagecont">
            <div className="main-img-profile">
              <div className="profile-image-container-account">
                {loading && (
                  <div className="loader-overlayyy">
                    <Spinner />
                  </div>
                )}
                <FaCamera
                  className="camera-icon-account"
                  onClick={() => document.getElementById("fileInput").click()}
                />
                <div className="img-profile">
                  <img
                    src={loginUserProfile || placeholderImage}
                    alt="Logged in user"
                    className="profile-image-account"
                  />
                </div>
              </div>

              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".png, .jpg, .jpeg, .jfif"
              />
            </div>
          </Col>
        </Row>
        <Modal
          show={showCropModal}
          onHide={() => setShowCropModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Crop Image</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div
              className="crop-container"
              style={{ position: "relative", height: "300px", width: "100%" }}
            >
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="square"
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCropModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCropConfirm}>
              Crop and Save
            </Button>
          </Modal.Footer>
        </Modal>
        <Row className="mt-5">
          <Col md={1}></Col>
          <Col md={3} className="">
            <div>
              <h5 className="usernamecss">{user_name}</h5>
            </div>

            <Nav
              defaultActiveKey="Personal Info"
              className="flex-column"
              onSelect={(selectedKey) => setActiveTab(selectedKey)}
            >
              <Nav.Link eventKey="Personal Info">Personal Info</Nav.Link>
              <Nav.Link eventKey="Change Password">Change Password</Nav.Link>
            </Nav>
          </Col>
          <Col md={8}>{renderTabContent()}</Col>
        </Row>
      </Container>
    </>
  );
};

export default ManageYourAccount;
