import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import jsPDF from 'jspdf';

const OfferLetter = () => {
  const [letterContent, setLetterContent] = useState({
    companyName: '',
    companyContact: '',
    date: '',
    candidateAddress: '',
    candidateCity: '',
    candidateState: '',
    candidateZip: '',
    candidateEmail: '',
    candidateName: '',
    jobTitle: '',
    departmentName: '',
    supervisorName: '',
    startDate: '',
    location: '',
    salary: '',
    bonuses: '',
    benefits: '',
    otherPerks: '',
    workHours: '',
    probationPeriod: '',
    leavePolicy: '',
    manageMentName: '',
    manageMentTitle:'',
  });

  const [status, setStatus] = useState('');
  const [savedLetter, setSavedLetter] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');

  // Fetch usernames on component mount
  useEffect(() => {
    axios.get(import.meta.env.VITE_API_CUSTOM_USERS, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
      },
    })
    .then(response => {
      // Assuming each user object contains a 'role' property
      const filteredUsers = response.data.filter(user => 
        user.role === 'employee' || user.role === 'hr'
      );
      setUsers(filteredUsers);
    })
    .catch(error => {
      setStatus('Error fetching users.');
    });
  }, []);

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const user = users.find(u => u.id === parseInt(userId));
    if (user) {
      setSelectedUserId(user.id);
      setSelectedUserName(user.name); // Assuming the user's name is in a 'name' property
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLetterContent((prevContent) => ({
      ...prevContent,
      [name]: value,
    }));
  };

  const generateLetter = (e) => {
    e.preventDefault();
  const letter = `
    ${letterContent.companyName} 

    Date: ${letterContent.date}

    To,

    ${letterContent.candidateName}
    ${letterContent.candidateAddress}
    ${letterContent.candidateCity},${letterContent.candidateState}, ${letterContent.candidateZip}

    Dear ${letterContent.candidateName},

    Subject: Offer of Employment

    We are pleased to offer you the position of ${letterContent.jobTitle} at ${letterContent.companyName}. After reviewing your qualifications and experience, we believe you will be a valuable addition to our team.

    Job Details:
    - Position: ${letterContent.jobTitle}
    - Department: ${letterContent.departmentName}
    - Reporting To: ${letterContent.supervisorName}
    - Start Date: ${letterContent.startDate}
    - Location: ${letterContent.location}

    Compensation and Benefits:
    - Salary: ${letterContent.salary} per [year]
    - Bonuses: ${letterContent.bonuses}
    - Benefits: ${letterContent.benefits}
    - Other Perks: ${letterContent.otherPerks}

    Terms and Conditions:
    - Work Hours: ${letterContent.workHours}
    - Probation Period: ${letterContent.probationPeriod}
    - Leave Policy: ${letterContent.leavePolicy}
    - Confidentiality Agreement: [Brief Description]

    Please review the terms of this offer and confirm your acceptance by signing and returning a copy of this letter by ${letterContent.date}. If you have any questions or need further information, feel free to contact us at ${letterContent.companyContact}.

    We are excited about the prospect of you joining our team and contributing to our success. We look forward to your positive response.

    Congratulations and welcome to ${letterContent.companyName}!

    Sincerely,

    ${letterContent.manageMentName}
    ${letterContent.manageMentTitle}

    ${letterContent.companyName}
    ${letterContent.companyContact}

    Acceptance:
    I, ${letterContent.candidateName}, accept the offer for the position of ${letterContent.jobTitle} at ${letterContent.companyName} under the terms and conditions mentioned above.

    Signature: ___________________________

    Date: ___________________________
  `;

    // Create jsPDF document in portrait mode with A4 size
  const doc = new jsPDF('p', 'mm', 'a4');

  // Set margins for A4
    const margins = { top: 10, left: 15, right: 15, bottom: 10 }
  // Calculate available width (A4 width - left and right margins)
  const pageWidth = 210 - margins.left - margins.right;

  // Set font size for the document
  doc.setFontSize(10);

  // Split text into lines to fit within the available width
  const textLines = doc.splitTextToSize(letter, pageWidth);

  // Start writing text from the top margin
  let verticalPosition = margins.top;
  
  // Loop through each line and add to PDF
  textLines.forEach((line) => {
    doc.text(line, margins.left, verticalPosition);
    verticalPosition += 5; // Adjust line height
  });

  // Save the generated PDF
  doc.save(`${letterContent.candidateName}_OfferLetter.pdf`);
    
  axios
    .post(
      `${import.meta.env.VITE_API_LETTER}`,
      {
        user_id: selectedUserId,
        offer_letter: letter,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    )
    .then((response) => {
      setStatus("Offer letter saved successfully.");
      setSavedLetter(letter); // Optionally display the saved letter
    })
    .catch((error) => {
      console.error("Error saving offer letter:", error);
      setStatus("Error saving offer letter.");
    });
};


  return (
     <Container>
      <h1>Offer Letter</h1>
      <Card>
        <Card.Body>
          <Form>
            {/* Username and User ID fields in two columns */}
            <Row>
              <Col md={6}>
                <Form.Group controlId="userName">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedUserId}
                    onChange={handleUserChange}
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="userId">
                  <Form.Label>User ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedUserId}
                    readOnly
                    placeholder="User ID will appear here"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Letter content fields dynamically split into two columns */}
            <Row>
              {Object.keys(letterContent).map((key, index) => (
                <Col md={6} key={key}>
                  <Form.Group controlId={key}>
                    <Form.Label>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</Form.Label>
                    <Form.Control
                      type="text"
                      name={key}
                      value={letterContent[key]}
                      onChange={handleChange}
                      placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>

            <Button variant="primary" onClick={generateLetter}>
              Generate Letter
            </Button>

            {status && <div className="mt-3">{status}</div>}

            {savedLetter && (
              <Card className="mt-3">
                <Card.Body>
                  <h3>Saved Offer Letter</h3>
                  <pre>{savedLetter}</pre>
                </Card.Body>
              </Card>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OfferLetter;
