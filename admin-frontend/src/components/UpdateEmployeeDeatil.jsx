// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { Col, Container, Row, Form, Button, Alert } from "react-bootstrap";
// import axios from "axios";

// const UpdateEmployeeDetail = () => {
//   const { id } = useParams();
//   const [userName, setUserName] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [address, setAddress] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [image, setImage] = useState("");
//   const [dob, setDob] = useState("");
//   const [userEmail, setUserEmail] = useState("");
//   const [userPassword, setUserPassword] = useState("");
//   const [selectedUserRole, setSelectedUserRole] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const token = localStorage.getItem("authtoken");

//   useEffect(() => {
//     const fetchEmployeeData = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_API_REGISTER}/${id}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         const data = response.data;
//         setFirstName(data.firstname);
//         setLastName(data.lastname);
//         setAddress(data.address);
//         setMobile(data.mobile);
//         setImage(data.profileimage);
//         setDob(data.dob);
//         setUserName(data.username);
//         setUserEmail(data.email);
//         setSelectedUserRole(data.role);
//       } catch (error) {
//         console.error("Error fetching employee data:", error);
//         setErrorMessage("Failed to fetch employee data.");
//       }
//     };

//     fetchEmployeeData();
//   }, [id]);

//   const handleUpdateUser = async (e) => {
//     e.preventDefault();

//     const userData = {
//       firstname: firstName,
//       lastname: lastName,
//       address: address,
//       mobile: mobile,
//       profileimage: image,
//       dob: dob,
//       username: userName,
//       email: userEmail,
//       password: userPassword,
//       role: selectedUserRole,
//     };

//     try {
//       const response = await axios.put(
//         `${import.meta.env.VITE_API_REGISTER}/${id}`,
//         userData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         setSuccessMessage("User updated successfully!");
//       } else {
//         setErrorMessage(`Failed to update user. Status code: ${response.status}`);
//       }
//     } catch (error) {
//       console.error("Error updating user:", error);
//       if (error.response) {
//         setErrorMessage(
//           `Failed to update user. Error: ${
//             error.response.data.message || error.response.statusText
//           }`
//         );
//       } else if (error.request) {
//         setErrorMessage(
//           "No response received from the server. Please try again later."
//         );
//       } else {
//         setErrorMessage(`Failed to update user. Error: ${error.message}`);
//       }
//     }
//   };

//   return (
//     <Container>
//       <Row>
//         <Col>
//           <h3>Edit User</h3>
//           {successMessage && <Alert variant="success">{successMessage}</Alert>}
//           {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
//           <Form onSubmit={handleUpdateUser}>
//             <Row>
//               <Col>
//                 <Form.Group controlId="formFirstName">
//                   <Form.Control
//                     type="text"
//                     value={firstName}
//                     placeholder="First name"
//                     onChange={(e) => setFirstName(e.target.value)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group controlId="formLastName">
//                   <Form.Control
//                     type="text"
//                     value={lastName}
//                     placeholder="Last name"
//                     onChange={(e) => setLastName(e.target.value)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row>
//               <Col>
//                 <Form.Group controlId="formUserName">
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter username"
//                     value={userName}
//                     onChange={(e) => setUserName(e.target.value)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group controlId="formUserEmail">
//                   <Form.Control
//                     type="email"
//                     placeholder="Enter email"
//                     value={userEmail}
//                     onChange={(e) => setUserEmail(e.target.value)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row>
//               <Col>
//                 <Form.Group controlId="formAddress">
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter Address"
//                     value={address}
//                     onChange={(e) => setAddress(e.target.value)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group controlId="formUserRole">
//                   <Form.Control
//                     as="select"
//                     value={selectedUserRole}
//                     onChange={(e) => setSelectedUserRole(e.target.value)}
//                     required
//                   >
//                     <option value="">Select role...</option>
//                     <option value="employee">employee</option>
//                   </Form.Control>
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row>
//               <Col>
//                 <Form.Group controlId="formMobile">
//                   <Form.Control
//                     type="tel"
//                     placeholder="Enter Mobile Number"
//                     value={mobile}
//                     onChange={(e) => setMobile(e.target.value)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group controlId="ImageStyle">
//                   <Form.Control
//                     type="file"
//                     placeholder="profile-image"
//                     value={image}
//                     onChange={(e) => setImage(e.target.value)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row>
//               <Col>
//                 <Form.Group controlId="formDob">
//                   <Form.Control
//                     type="date"
//                     value={dob}
//                     onChange={(e) => setDob(e.target.value)}
//                     required
//                   ></Form.Control>
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group controlId="formUserPassword">
//                   <Form.Control
//                     type="password"
//                     placeholder="Enter password"
//                     value={userPassword}
//                     onChange={(e) => setUserPassword(e.target.value)}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Button variant="primary" type="submit">
//               Update User
//             </Button>
//           </Form>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default UpdateEmployeeDetail;
