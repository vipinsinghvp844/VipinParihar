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
import "./BasicInfoForm.css"; // 🧩 Shared styles

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
  role: Yup.string().required("Role is required"),
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string(),
  mobile: Yup.string()
    .matches(/^\d{10}$/, "Mobile must be 10 digits")
    .required("Mobile number is required"),
  dob: Yup.string().required("Date of birth is required"),
});

const BasicInfoForm = ({ onNext, initialData = {} }) => {
  const formik = useFormik({
    initialValues: {
      username: initialData.username || "",
      email: initialData.email || "",
      password: initialData.password || "",
      role: initialData.role || "",
      firstname: initialData.firstname || "",
      lastname: initialData.lastname || "",
      mobile: initialData.mobile || "",
      dob: initialData.dob || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
        personalInfo: {
          firstname: values.firstname,
          lastname: values.lastname,
          mobile: values.mobile,
          dob: values.dob,
        },
      };
      onNext(payload);
    },
  });

  return (
    <Paper elevation={3} className="form-container">
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h5" className="form-title">
          Basic Information
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              {...formik.getFieldProps("username")}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              {...formik.getFieldProps("email")}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              {...formik.getFieldProps("password")}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Role"
              name="role"
              {...formik.getFieldProps("role")}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="firstname"
              {...formik.getFieldProps("firstname")}
              error={
                formik.touched.firstname && Boolean(formik.errors.firstname)
              }
              helperText={formik.touched.firstname && formik.errors.firstname}
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastname"
              {...formik.getFieldProps("lastname")}
              error={formik.touched.lastname && Boolean(formik.errors.lastname)}
              helperText={formik.touched.lastname && formik.errors.lastname}
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mobile"
              name="mobile"
              {...formik.getFieldProps("mobile")}
              error={formik.touched.mobile && Boolean(formik.errors.mobile)}
              helperText={formik.touched.mobile && formik.errors.mobile}
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="DOB"
              name="dob"
              InputLabelProps={{ shrink: true }}
              {...formik.getFieldProps("dob")}
              error={formik.touched.dob && Boolean(formik.errors.dob)}
              helperText={formik.touched.dob && formik.errors.dob}
              className="input-field"
            />
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="flex-end">
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
};

export default BasicInfoForm;
