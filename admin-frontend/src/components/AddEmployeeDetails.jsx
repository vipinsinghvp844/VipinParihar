import React, { useState, useEffect } from "react";
import { Form, Button, Container, Col, Row } from "react-bootstrap";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AddEmployeeDetails = () => {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name_of_bank: "",
    account_number: "",
    name_in_bank: "",
    // status: "Active",    // Default status Active
    gender: "",
    marital_status: "",
    department: "",
    duty_type: "",
    position: "",
    basic_salary: "",
    ifsc_code: "",
    branch: "",
    graduation_year: "",
    graduation_subject: "",
    pg_year: "",
    pg_subject: "",
    professional_course_year: "",
    professional_course_subject: "",
    employment_type: "",
    previous_employer_name: "",
    date_of_joining: "",
    date_of_leaving: "",
  });
  const { TotalUsers, TotalAttendance, TotalEmployeeInLeave } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // const response = await axios.get(
        //   `${import.meta.env.VITE_API_CUSTOM_USERS}`
        // );
        const employeeUsers = TotalUsers.filter(
          (user) => user.role === "employee" || user.role === "hr"
        );
        setEmployees(employeeUsers);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  //  useEffect(() => {
  //   // Auto-update status based on date_of_leaving
  //   if (formData.date_of_leaving) {
  //     setFormData((prevState) => ({
  //       ...prevState,
  //       status: "Inactive",
  //     }));
  //   } else {
  //     setFormData((prevState) => ({
  //       ...prevState,
  //       status: "Active",
  //     }));
  //   }
  // }, [formData.date_of_leaving]);

  const handleUserSelection = (employee) => {
    setUserName(employee.username);
    setUserId(employee.id);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        user_id: userId,
        ...formData,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_PERSONAL_INFO}`,
        payload
      );
      // setMessage("Details added successfully!");
      toast.success("Details added successfully!");
      setUserName("");
      setUserId("");
      setFormData({
        // status: "Active",
        gender: "",
        marital_status: "",
        department: "",
        duty_type: "",
        position: "",
        basic_salary: "",
        name_of_bank: "",
        account_number: "",
        name_in_bank: "",
        ifsc_code: "",
        branch: "",
        graduation_year: "",
        graduation_subject: "",
        pg_year: "",
        pg_subject: "",
        professional_course_year: "",
        professional_course_subject: "",
        employment_type: "",
        previous_employer_name: "",
        date_of_joining: "",
        date_of_leaving: "",
      });
    } catch (error) {
      // setMessage("Error adding details. Please try again.");
      toast.error("Error adding details. Please try again.");
      console.error("Error adding details:", error);
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col md={1}>
          <i className="bi bi-arrow-left-circle" onClick={() => window.history.back()} style={{
          cursor: "pointer",
          fontSize: "32px",
          color: "#343a40",
        }}></i>
        </Col>
        <Col md={10}>
          <h3 className="mt-2">Add Employee Details</h3>
          </Col>
        </Row>
      <Form onSubmit={handleSubmit}>
        <Row>
        <Col>
        <Form.Group controlId="formUserName">
          <Form.Label>User Name</Form.Label>
          <div className="dropdown-wrapper">
            <Form.Control
              type="text"
              placeholder="Click to select user name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onClick={() => setShowDropdown(!showDropdown)}
              required
            />
            {showDropdown && (
              <ul className="dropdown-menu">
                {employees.map((employee) => (
                  <li
                    key={employee.id}
                    className="dropdown-item"
                    onClick={() => handleUserSelection(employee)}
                  >
                    {employee.username}
                  </li>
                ))}
              </ul>
            )}
          </div>
          </Form.Group>
        </Col>
        <Col>
        {/* Add form fields for other data */}
        <Form.Group controlId="gender">
          <Form.Label> Gender</Form.Label>
          <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
          </Form.Group>
          </Col>
        </Row>
        <Row><Col>
        <Form.Group controlId="MaritalStatus">
          <Form.Label> Marital Status</Form.Label>
          <Form.Select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Marital Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </Form.Select>
          </Form.Group>
        </Col>
          <Col>
        <Form.Group controlId="Department">
          <Form.Label> Department</Form.Label>
          <Form.Select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Support">Support</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            </Col>
        </Row>
        <Row><Col>
        <Form.Group controlId="DutyType">
          <Form.Label> Duty Type</Form.Label>
          <Form.Select
                name="duty_type"
                value={formData.duty_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Duty Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Other">Other</option>
              </Form.Select>
          </Form.Group>
        </Col>
          <Col>
        <Form.Group controlId="Position">
          <Form.Label> Designation </Form.Label>
          <Form.Control
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Type or select a position"
                list="positionList"
                required
              />
              <datalist id="positionList">
                <option value="Developer" />
                <option value="Frontend Developer" />
              </datalist>
            </Form.Group>
          </Col>
        </Row>
        <Row><Col>
        <Form.Group controlId="formBankName">
          <Form.Label>Bank Name</Form.Label>
          <Form.Control
            type="text"
            name="name_of_bank"
            value={formData.name_of_bank}
            onChange={handleInputChange}
            required
          />
          </Form.Group>
        </Col>
          <Col>
        <Form.Group controlId="nameInBank">
          <Form.Label>Name in Bank</Form.Label>
          <Form.Control
            type="text"
            name="name_in_bank"
            value={formData.name_in_bank}
            onChange={handleInputChange}
            required
          />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
          <Form.Group controlId="AccountNumber">
          <Form.Label>Account Number</Form.Label>
          <Form.Control
            type="text"
            name="account_number"
            value={formData.account_number}
            onChange={handleInputChange}
            required
          />
            </Form.Group>
          </Col>
        </Row>
        <Row><Col>
        <Form.Group controlId="IFSCBANK">
          <Form.Label>IFSC of Bank</Form.Label>
          <Form.Control
            type="text"
            name="ifsc_code"
            value={formData.ifsc_code}
            onChange={handleInputChange}
            required
          />
          </Form.Group>
        </Col>
          <Col>
        <Form.Group controlId="Branch">
          <Form.Label>Branch</Form.Label>
          <Form.Control
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleInputChange}
            required
          />
            </Form.Group>
          </Col>
        </Row>
        <Row><Col>
        <Form.Group controlId="BasicSalary">
          <Form.Label> Basic Salary </Form.Label>
          <Form.Control
            type="text"
            name="basic_salary"
            value={formData.basic_salary}
            onChange={handleInputChange}
            required
          />
          </Form.Group>
        </Col>
          <Col>
        
        <Form.Group controlId="GradutionYear">
          <Form.Label>Graduation Year</Form.Label>
          <Form.Control
            type="text"
            name="graduation_year"
            value={formData.graduation_year}
            onChange={handleInputChange}
            
          />
            </Form.Group>
          </Col>
        </Row>
        <Row><Col>
        <Form.Group controlId="GradutionSubject">
          <Form.Label>Graduation Subject</Form.Label>
          <Form.Control
            type="text"
            name="graduation_subject"
            value={formData.graduation_subject}
            onChange={handleInputChange}
            
          />
          </Form.Group>
        </Col>
          <Col>
        <Form.Group controlId="PgYear">
          <Form.Label>PG Year</Form.Label>
          <Form.Control
            type="text"
            name="pg_year"
            value={formData.pg_year}
            onChange={handleInputChange}
            
          />
            </Form.Group>
          </Col>
        </Row>
        <Row><Col>
        <Form.Group controlId="PgSubject">
          <Form.Label>PG Subject</Form.Label>
          <Form.Control
            type="text"
            name="pg_subject"
            value={formData.pg_subject}
            onChange={handleInputChange}
            
          />
          </Form.Group>
        </Col>
          <Col>
        <Form.Group controlId="PofessionalCourseYear">
          <Form.Label> Professional Course Year</Form.Label>
          <Form.Control
            type="text"
            name="professional_course_year"
            value={formData.professional_course_year}
            onChange={handleInputChange}
           
          />
            </Form.Group>
          </Col>
        </Row>
        <Row><Col>
        <Form.Group controlId="PofessionalCourseSubject">
          <Form.Label> Professional Course Subject</Form.Label>
          <Form.Control
            type="text"
            name="professional_course_subject"
            value={formData.professional_course_subject}
            onChange={handleInputChange}
            
          />
        </Form.Group>
        </Col>
          <Col>
        
        <Form.Group controlId="EmploymentType">
          <Form.Label> Employment Type</Form.Label>
          <Form.Select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Employment Type</option>
                <option value="Intern">Intern</option>
                <option value="Permanent">Permanent</option>
                <option value="Remote">Remote</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row><Col>
        <Form.Group controlId="PreviosEmployerName">
          <Form.Label> Previous Employer Name</Form.Label>
          <Form.Control
            type="text"
            name="previous_employer_name"
            value={formData.previous_employer_name}
            onChange={handleInputChange}
            required
          />
          </Form.Group>
        </Col>
          {/* <Col>
        
        <Form.Group controlId="Status">
          <Form.Label>Status</Form.Label>
          <Form.Control
                type="text"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                readOnly
              />
            </Form.Group>
          </Col> */}
        </Row>
        <Row><Col>
        <Form.Group controlId="DateofJoining">
          <Form.Label> Date of Joining</Form.Label>
          <Form.Control
            type="date"
            name="date_of_joining"
            value={formData.date_of_joining}
            onChange={handleInputChange}
            required
          />
          </Form.Group>
        </Col>
          <Col>
        <Form.Group controlId="DateofLeaving">
          <Form.Label> Date of leaving</Form.Label>
          <Form.Control
            type="date"
            name="date_of_leaving"
            value={formData.date_of_leaving}
            onChange={handleInputChange}
          />
            </Form.Group>
          </Col>
          </Row>
        {/* Add other fields similarly */}
        <Button variant="primary" type="submit" >
          Submit
        </Button>
      </Form>
      {/* {message && <p>{message}</p>} */}
    </Container>
  );
};

export default AddEmployeeDetails;
