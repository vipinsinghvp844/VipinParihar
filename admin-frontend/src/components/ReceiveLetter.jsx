import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Col, Container, Row } from 'react-bootstrap';

function ReceiveLetter() {
  const [letters, setLetters] = useState([]);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_LETTER}/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
      },
    })
      .then(response => {
        if (Array.isArray(response.data)) {
          setLetters(response.data);
        } else if (response.data && typeof response.data === 'object') {
          setLetters([response.data]); // Wrap the object in an array
        } else {
          setError('Unexpected response format.');
        }
      })
      .catch(() => {
        setError('Error fetching letters.');
      });
  }, [userId]);

  return (
    <Container>
      <Row className="mb-4 d-flex">
        <Col md={1}>
          <i className="bi bi-arrow-left-circle" onClick={() => window.history.back()} style={{
            cursor: "pointer",
            fontSize: "32px",
            color: "#343a40",
          }}></i>
        </Col>
        <Col md={9}>
          <h3 className="mt-2">Letters</h3>
        </Col>
      </Row>
      <Row>
        {error ? (
          <Col>
            <p>{error}</p>
          </Col>
        ) : (
          letters.map(letter => (
            <Col key={letter.id} >
              <div className="card">
                <div className="card-body">
                  <pre className="card-text">{letter.letter_content}</pre>
                </div>
              </div>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}

export default ReceiveLetter;
