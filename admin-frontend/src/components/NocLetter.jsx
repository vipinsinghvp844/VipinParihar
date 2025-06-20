import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';

const NocLetter = () => {
  const [letterContent, setLetterContent] = useState({
    companyName: '',
    candidateName: '',
    jobTitle: '',
    departmentName: '',
    startDate: '',
    endDate: '',
    purpose: '',
  });

  const [status, setStatus] = useState('');
  const [savedLetter, setSavedLetter] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch usernames on component mount
  useEffect(() => {
    axios.get(import.meta.env.VITE_API_CUSTOM_USERS, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
      },
    })
    .then(response => {
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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLetterContent((prevContent) => ({
      ...prevContent,
      [name]: value,
    }));
  };

  const generateLetter = () => {
    const letter = `
      [${letterContent.companyName} Letterhead]

      Date: [Date]

      To Whom It May Concern,

      This is to certify that ${letterContent.candidateName} has been employed with ${letterContent.companyName} as a ${letterContent.jobTitle} in the ${letterContent.departmentName} department from ${letterContent.startDate} to ${letterContent.endDate}.

      ${letterContent.companyName} has no objection to ${letterContent.candidateName} pursuing [Purpose] during their tenure with us. We wish them all the best for their future endeavors.

      Sincerely,

      [Your Name]
      [Your Job Title]
      ${letterContent.companyName}
      [Contact Information]
    `;

    axios
      .post(
        `${import.meta.env.VITE_API_LETTER}`,
        {
          user_id: selectedUserId,
          noc: letter, // Adjust the key as per your backend requirement
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      )
      .then((response) => {
        setStatus("NOC letter saved successfully.");
      })
      .catch((error) => {
        setStatus("Error saving NOC letter.");
      });
  };

  return (
    <Container>
      <h1> NOC Letter</h1>
      <Card>
        <Card.Body>
          <Form>
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
            
            <Form.Group controlId="userId">
              <Form.Label>User ID</Form.Label>
              <Form.Control
                type="text"
                value={selectedUserId}
                readOnly
                placeholder="User ID will appear here"
              />
            </Form.Group>

            {Object.keys(letterContent).map((key) => (
              <Form.Group controlId={key} key={key}>
                <Form.Label>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</Form.Label>
                <Form.Control
                  type="text"
                  name={key}
                  value={letterContent[key]}
                  onChange={handleChange}
                  placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
                />
              </Form.Group>
            ))}
            <Button variant="primary" onClick={generateLetter}>
              Generate Letter
            </Button>
            {status && <div className="mt-3">{status}</div>}
            {savedLetter && (
              <Card className="mt-3">
                <Card.Body>
                  <h3>Saved NOC Letter</h3>
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

export default NocLetter;
