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
import "./BankDetailsForm.css"; // 🔗 Link to custom CSS

export default function BankDetailsForm({ initialData = {}, onNext, onBack }) {
  const formik = useFormik({
    initialValues: {
      bankName: initialData.bankName || "",
      accountNumber: initialData.accountNumber || "",
      IFSC: initialData.IFSC || "",
      bankBranch: initialData.bankBranch || "",
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const payload = {
        bankDetails: {
          bankName: values.bankName,
          accountNumber: values.accountNumber,
          IFSC: values.IFSC,
          bankBranch: values.bankBranch,
        },
      };
      onNext(payload);
    },
  });

  return (
    <Paper elevation={3} className="form-container">
      <form onSubmit={formik.handleSubmit}>
        <Typography variant="h5" className="form-title">
          Bank Details
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Name"
              name="bankName"
              variant="outlined"
              {...formik.getFieldProps("bankName")}
              error={formik.touched.bankName && Boolean(formik.errors.bankName)}
              helperText={formik.touched.bankName && formik.errors.bankName}
              className="input-field"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Account Number"
              name="accountNumber"
              variant="outlined"
              {...formik.getFieldProps("accountNumber")}
              error={
                formik.touched.accountNumber &&
                Boolean(formik.errors.accountNumber)
              }
              helperText={
                formik.touched.accountNumber && formik.errors.accountNumber
              }
              className="input-field"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="IFSC Code"
              name="IFSC"
              variant="outlined"
              {...formik.getFieldProps("IFSC")}
              error={formik.touched.IFSC && Boolean(formik.errors.IFSC)}
              helperText={formik.touched.IFSC && formik.errors.IFSC}
              className="input-field"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Branch"
              name="bankBranch"
              variant="outlined"
              {...formik.getFieldProps("bankBranch")}
              error={
                formik.touched.bankBranch && Boolean(formik.errors.bankBranch)
              }
              helperText={formik.touched.bankBranch && formik.errors.bankBranch}
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
            Next
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
