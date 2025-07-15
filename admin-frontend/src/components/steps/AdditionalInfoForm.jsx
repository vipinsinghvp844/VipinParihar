import React from "react";
import { useFormik } from "formik";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";

export default function AdditionalInfoForm({ initialData = {}, onSubmit, onBack }) {
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
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Additional Information (Optional)
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              {...formik.getFieldProps("address")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Graduation Year"
              name="graduationYear"
              {...formik.getFieldProps("graduationYear")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Previous Employer Name"
              name="previousEmpName"
              {...formik.getFieldProps("previousEmpName")}
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
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      </Box>
    </form>
  );
}
