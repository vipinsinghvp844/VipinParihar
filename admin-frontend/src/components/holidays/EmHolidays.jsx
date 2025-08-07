import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, ListGroup } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './EmHolidays.css'; // Assuming you have a custom CSS file for additional styles


const EmHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [filteredHolidays, setFilteredHolidays] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
    type: '',
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_HOLIDAYS}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
        },
      });
      setHolidays(response.data);
      setFilteredHolidays(response.data); // Initially set to all holidays
      // console.log(response.data)
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filteredList = holidays;

    if (filters.date) {
      filteredList = filteredList.filter((holiday) => holiday.holiday_date === filters.date);
    }
    if (filters.type) {
      filteredList = filteredList.filter((holiday) => holiday.holiday_type === filters.type);
    }

    setFilteredHolidays(filteredList);
  };

  const resetFilters = () => {
    setFilters({
      date: '',
      type: '',
    });
    setFilteredHolidays(holidays);
  };

  const renderHolidayListItem = (holiday) => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = holiday.holiday_date === today;

    return (
      <ListGroup.Item key={holiday.id} className={isToday ? 'highlight-today' : ''}>
        {holiday.holiday_name} - {holiday.holiday_date} ({holiday.holiday_type})
      </ListGroup.Item>
    );
  };

  const tileContent = ({ date }) => {
    const formattedDate = date.toISOString().split('T')[0];
    const isHoliday = holidays.some((holiday) => holiday.holiday_date === formattedDate);

    return isHoliday ? <div className="highlight-holiday"></div> : null;
  };

  return (
    <Container className="mt-4 ">
      <Row className="mb-4 d-flex">
        <Col md={1}>
          <i className="bi bi-arrow-left-circle" onClick={() => window.history.back()} style={{
          cursor: "pointer",
          fontSize: "32px",
          color: "#343a40",
        }}></i>
        </Col>
        <Col md={9} >
          <h3 className="mt-2">Holidays</h3>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header as="h4">Filter Holidays</Card.Header>
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Group controlId="filterDate">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="filterType">
                  <Form.Label>Type</Form.Label>
                  <Form.Control
                    as="select"
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select Type</option>
                    <option value="Public Holiday">Public Holiday</option>
                    <option value="Company Holiday">Company Holiday</option>
                    <option value="Other">Other</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex">
                <Button variant="primary" className="me-2" onClick={applyFilters}>
                  Apply Filters
                </Button>
                <Button variant="secondary" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header as="h4">Holiday List</Card.Header>
            <Card.Body>
              <ListGroup>
                {filteredHolidays.length > 0 ? (
                  filteredHolidays.map((holiday) => renderHolidayListItem(holiday))
                ) : (
                  <ListGroup.Item>No holidays available.</ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header as="h4">Calendar View</Card.Header>
            <Card.Body>
              <Calendar tileContent={tileContent} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmHolidays;
