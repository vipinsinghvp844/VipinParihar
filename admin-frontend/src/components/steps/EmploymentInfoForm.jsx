import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";

// const validationSchema = Yup.object({
//   designation: Yup.string().required("Designation is required"),
//   department: Yup.string().required("Department is required"),
//   dutyType: Yup.string().required("Duty type is required"),
//   emloyeementType: Yup.string().required("Employment type is required"),
//   dateOfJoining: Yup.date().required("Date of joining is required"),
// });

export default function EmploymentInfoForm({ initialData = {}, onNext, onBack }) {
  // const formik = useFormik({
  //   initialValues: {
  //     designation: initialData.designation || "",
  //     department: initialData.department || "",
  //     dutyType: initialData.dutyType || "",
  //     emloyeementType: initialData.emloyeementType || "",
  //     dateOfJoining: initialData.dateOfJoining || "",
  //   },
  //   // validationSchema,
  //   onSubmit: (values) => {
  //     onNext(values); // move to next step with collected data
  //   },
  // });

  const formik = useFormik({
    initialValues: {
      designation: initialData.designation || "",
      department: initialData.department || "",
      dutyType: initialData.dutyType || "",
      emloyeementType: initialData.emloyeementType || "",
      dateOfJoining: initialData.dateOfJoining || "",
    },
    enableReinitialize: true,
    // validationSchema,
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
      onNext(payload); // move to next step with collected data
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Employment Information
        </Typography>
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
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <Button variant="contained" type="submit">
            Next
          </Button>
        </Box>
      </Box>
    </form>
  );
}
