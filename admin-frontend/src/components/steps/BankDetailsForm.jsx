import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";

// const validationSchema = Yup.object({
//   bankName: Yup.string().required("Bank name is required"),
//   accountNumber: Yup.string()
//     .matches(/^\d+$/, "Account number must be digits only")
//     .required("Account number is required"),
//   IFSC: Yup.string()
//     .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code")
//     .required("IFSC is required"),
//   bankBranch: Yup.string().required("Bank branch is required"),
// });

export default function BankDetailsForm({ initialData = {}, onNext, onBack }) {
  const formik = useFormik({
    initialValues: {
      bankName: initialData.bankName || "",
      accountNumber: initialData.accountNumber || "",
      IFSC: initialData.IFSC || "",
      bankBranch: initialData.bankBranch || "",
    },
    enableReinitialize: true,
    // validationSchema,
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
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Bank Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Name"
              name="bankName"
              {...formik.getFieldProps("bankName")}
              error={formik.touched.bankName && Boolean(formik.errors.bankName)}
              helperText={formik.touched.bankName && formik.errors.bankName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Account Number"
              name="accountNumber"
              {...formik.getFieldProps("accountNumber")}
              error={
                formik.touched.accountNumber &&
                Boolean(formik.errors.accountNumber)
              }
              helperText={
                formik.touched.accountNumber && formik.errors.accountNumber
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="IFSC Code"
              name="IFSC"
              {...formik.getFieldProps("IFSC")}
              error={formik.touched.IFSC && Boolean(formik.errors.IFSC)}
              helperText={formik.touched.IFSC && formik.errors.IFSC}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Branch"
              name="bankBranch"
              {...formik.getFieldProps("bankBranch")}
              error={
                formik.touched.bankBranch && Boolean(formik.errors.bankBranch)
              }
              helperText={formik.touched.bankBranch && formik.errors.bankBranch}
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
