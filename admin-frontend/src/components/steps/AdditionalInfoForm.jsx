import React from "react";
import { useFormik } from "formik";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import "./AdditionalInfoForm.css"; // 🔗 Link to custom CSS

export default function AdditionalInfoForm({
  initialData = {},
  onSubmit,
  onBack,
}) {
  const formik = useFormik({
    initialValues: {
      address: initialData.address || "",
      graduationYear: initialData.graduationYear || "",
      previousEmpName: initialData.previousEmpName || "",
      dateOfLeaving: initialData.dateOfLeaving || "",
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const payload = {
        additionalInfoDetail: {
          address: values.address,
          graduationYear: values.graduationYear,
          previousEmpName: values.previousEmpName,
          dateOfLeaving: values.dateOfLeaving,
        },
      };
      onSubmit(payload);
    },
  });

  return (
    <Paper elevation={3} className="form-container">
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h5" className="form-title">
          Additional Information{" "}
          <span className="optional-tag">(Optional)</span>
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              {...formik.getFieldProps("address")}
              variant="outlined"
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Graduation Year"
              name="graduationYear"
              {...formik.getFieldProps("graduationYear")}
              variant="outlined"
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Previous Employer Name"
              name="previousEmpName"
              {...formik.getFieldProps("previousEmpName")}
              variant="outlined"
              className="input-field"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Leaving"
              name="dateOfLeaving"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...formik.getFieldProps("dateOfLeaving")}
              variant="outlined"
              className="input-field"
            />
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            onClick={onBack}
            className="form-button back-button"
          >
            Back
          </Button>
          <Button
            variant="contained"
            type="submit"
            className="form-button submit-button"
          >
            Submit
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
