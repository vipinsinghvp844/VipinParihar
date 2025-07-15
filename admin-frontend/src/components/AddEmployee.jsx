import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import BasicInfoForm from "./steps/BasicInfoForm";
import EmploymentInfoForm from "./steps/EmploymentInfoForm";
import BankDetailsForm from "./steps/BankDetailsForm";
import AdditionalInfoForm from "./steps/AdditionalInfoForm";
import axios from "axios";
import { toast } from "react-toastify";
import { Col, Container, Row } from "react-bootstrap";

// Define step labels
const steps = [
  "Basic Info",
  "Employment Info",
  "Bank Details",
  "Additional Info",
];

function AddEmployee() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});

  const handleNext = (stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinalSubmit = async (finalStepData) => {
    console.log("Final Step Data (from AdditionalInfoForm):", finalStepData);
    const fullData = {
      ...formData,
      ...finalStepData,
      personalInfo: {
        ...formData.personalInfo,
      },

      employmentInfo: {
        ...formData.employmentInfo,
      },

      bankDetails: {
        ...formData.bankDetails,
      },

      additionalInfoDetail: {
        ...formData.additionalInfoDetail,
      },
    };
    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/register`,
        fullData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      toast.success("User registered successfully!");
      setActiveStep(steps.length); // show success
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Registration failed");
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoForm
            onNext={handleNext}
            initialData={{
              username: formData.username || "",
              email: formData.email || "",
              password: formData.password || "",
              role: formData.role || "",
              ...(formData.personalInfo || {}),
            }}
          />
        );
      case 1:
        return (
          <EmploymentInfoForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={{ ...(formData.employmentInfo || {}) }}
          />
        );
        
      case 2:
        return (
          <BankDetailsForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={{ ...(formData.bankDetails || {}) }}
          />
        );
      case 3:
        return (
          <AdditionalInfoForm
            onSubmit={handleFinalSubmit}
            onBack={handleBack}
            initialData={{ ...(formData.additionalInfoDetail || {}) }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Container className="add-new-employee">
        <Row className="mb-4">
          <Col md={1}>
            <i
              className="bi bi-arrow-left-circle"
              onClick={() => window.history.back()}
              style={{
                cursor: "pointer",
                fontSize: "32px",
                color: "#343a40",
              }}
            ></i>
          </Col>
          <Col md={10}>
            <h3 className="mt-2">Register New Employee </h3>
          </Col>
        </Row>
        <Paper elevation={3} sx={{ maxWidth: 800, margin: "auto", p:1 }}>
          <Typography variant="h5" gutterBottom></Typography>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length ? (
            <Typography variant="h6" align="center">
               All steps completed — employee registered successfully!
            </Typography>
          ) : (
            <Box>{renderStepContent(activeStep)}</Box>
          )}
        </Paper>
      </Container>
    </>
  );
}
export default AddEmployee;
