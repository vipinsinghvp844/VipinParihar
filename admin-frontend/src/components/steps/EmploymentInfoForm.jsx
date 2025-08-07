import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import "./EmploymentInfoForm.css"; // or use shared "FormCommon.css"

const validationSchema = Yup.object({
  designation: Yup.string().required("Designation is required"),
  department: Yup.string().required("Department is required"),
  dutyType: Yup.string().required("Duty type is required"),
  emloyeementType: Yup.string().required("Employment type is required"),
  dateOfJoining: Yup.date().required("Date of joining is required"),
});

export default function EmploymentInfoForm({
  initialData = {},
  onNext,
  onBack,
}) {
  const formik = useFormik({
    initialValues: {
      designation: initialData.designation || "",
      department: initialData.department || "",
      dutyType: initialData.dutyType || "",
      emloyeementType: initialData.emloyeementType || "",
      dateOfJoining: initialData.dateOfJoining || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      const payload = {
        employmentInfo: {
          designation: values.designation,
          department: values.department,
          dutyType: values.dutyType,
          emloyeementType: values.emloyeementType,
          dateOfJoining: values.dateOfJoining,
        },
      };
      onNext(payload);
    },
  });

  return (
    <Paper elevation={3} className="form-container">
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h5" className="form-title">
          Employment Information
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Designation"
              name="designation"
              {...formik.getFieldProps("designation")}
              error={
                formik.touched.designation && Boolean(formik.errors.designation)
              }
              helperText={
                formik.touched.designation && formik.errors.designation
              }
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Department"
              name="department"
              {...formik.getFieldProps("department")}
              error={
                formik.touched.department && Boolean(formik.errors.department)
              }
              helperText={formik.touched.department && formik.errors.department}
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duty Type"
              name="dutyType"
              {...formik.getFieldProps("dutyType")}
              error={formik.touched.dutyType && Boolean(formik.errors.dutyType)}
              helperText={formik.touched.dutyType && formik.errors.dutyType}
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Employment Type"
              name="emloyeementType"
              {...formik.getFieldProps("emloyeementType")}
              error={
                formik.touched.emloyeementType &&
                Boolean(formik.errors.emloyeementType)
              }
              helperText={
                formik.touched.emloyeementType && formik.errors.emloyeementType
              }
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Joining"
              name="dateOfJoining"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...formik.getFieldProps("dateOfJoining")}
              error={
                formik.touched.dateOfJoining &&
                Boolean(formik.errors.dateOfJoining)
              }
              helperText={
                formik.touched.dateOfJoining && formik.errors.dateOfJoining
              }
              className="input-field"
            />
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={onBack} className="form-button">
            Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            className="form-button submit-button"
          >
            Next
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
