import React, { useState, useEffect } from "react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import LoaderSpiner from "./LoaderSpiner";
import { toast } from "react-toastify";
import TuneIcon from '@mui/icons-material/Tune';
import { GetEmployeeLeaveDetailAction } from "../../redux/actions/EmployeeDetailsAction";
import { Autocomplete, Box, Grid, IconButton, Popover, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { GetEmployeeLeaveDetailActionById } from "../../redux/actions/EmployeeDetailsAction";

const EmployeeViewLeave = () => {
  const [requests, setRequests] = useState([]);
  const [TotalRequetData, setTotalRequestData] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const dispatch = useDispatch();


  // jay working code start

  const [leaveType, setLeaveType] = useState(['Unpaid Leave', 'Paid Leave'])
  const [StatusStore, setStatus] = useState(['Rejected', 'Accept', 'Pending', 'Reject'])
  const [totalDayes, setTotalDays] = useState(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'])
  const [filterCriteria, setFilterCriteria] = useState({
    start_date: '',
    end_date: '',
    leave_type: '',
    total_leave_days: '',
    status: '',
    reason_for_leave: ''
  })

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function handleFilter() {

    setTimeout(() => {
      const filteredData = TotalRequetData.filter(item => {
        return Object.entries(filterCriteria).every(([key, value]) => {
          if (value == "" || value == undefined || value == null) {
            return true
          }
          else if (key == 'reason_for_leave') {
            return item[key].toLowerCase().includes(value.toLowerCase())
          }
          else {
            return item[key] == value
          }

        });
      });

      console.log('handleFilter', filteredData)
      setRequests(filteredData)
      handleClose()
    }, 1000);
  }

  function removeFilter() {
    setRequests(TotalRequetData)
    setFilterCriteria({
      start_date: '',
      end_date: '',
      leave_type: '',
      total_leave_days: '',
      status: '',
      reason_for_leave: ''
    });
    setAnchorEl(null);
    fetchLeaveData()
  }

  // jay working code end

  useEffect(() => {
    fetchLeaveData(); // Call the async function
  }, [dispatch]);

  const fetchLeaveData = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        setError("User not logged in. Please log in and try again.");
        setLoading(false);
        return;
      }

       setLoggedInUserId(user_id);
      const response = await dispatch(GetEmployeeLeaveDetailActionById());
      // setRequests(response.data);
      const filtdata = response.filter(
        (data) => String(data.user_id).trim() === String(user_id).trim()
      );
      setRequests(filtdata);
      setTotalRequestData(filtdata)
      setLoading(false);
    } catch (error) {
      setError("Error fetching leave requests.");
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = (requestId) => {
    if (!loggedInUserId) {
      setError("User not logged in. Please log in and try again.");
      return;
    }

    const request = requests.find((req) => req.id === requestId);
    const hrActionTaken = request?.status && request.status !== "Pending";

    if (hrActionTaken) {
      // setError(
      //   "Action by HR has already been taken on this request. Deletion not allowed."
      // );
      toast.error("Action by HR has already been taken on this request. Deletion not allowed.")
      return;
    }

    setShowConfirm(true);
    setDeleteRequestId(requestId);
  };
  const userId = localStorage.getItem("user_id");
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_LEAVE}/${userId}?id=${deleteRequestId}`,
        {
          data: { user_id: loggedInUserId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );

      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== deleteRequestId)
      );
      toast.success("Request deleted successfully")
      setShowConfirm(false);
      setDeleteRequestId(null);
    } catch (error) {
      console.error("Error deleting leave request:", error);
      setError("Error deleting leave request. Please try again later.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container>
      <Row className="mb-4 d-flex">
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
        <Col md={9}>
          <h3 className="mt-2 ">Apply Leave</h3>
        </Col>
      </Row>

      <div className="d-flex justify-content-between mb-2">
        <div>
          <Button variant="" className='min-width-auto px-2 btn-blue' size='small' onClick={handleClick}>
            <TuneIcon />
          </Button>

          <Popover
            // id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}

            className='p-5'

          >
            <Box className='client-details-filter p-2'
              sx={{ maxWidth: '460px', width: '460px', margin: '10px' }}
            >

              <Grid Grid container rowSpacing={0} columnSpacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={6} xl={6} xxl={6}>
                  <Autocomplete
                    disablePortal
                    options={leaveType}
                    renderInput={(params) => <TextField {...params} label="Leave Type" />}
                    size="small"
                    value={filterCriteria.leave_type}
                    onChange={(e, newValue) => {
                      setFilterCriteria((prev) => ({
                        ...prev,
                        leave_type: newValue
                      }));

                    }}
                    id="leaveType"
                  />
                </Grid>

                <Grid item xs={12} sm={12} md={12} lg={6} xl={6} xxl={6} className="">
                  <Autocomplete
                    disablePortal
                    options={StatusStore}
                    renderInput={(params) => <TextField {...params} label="Status" />}
                    size="small"
                    value={filterCriteria.status}
                    onChange={(e, newValue) => {
                      setFilterCriteria((prev) => ({
                        ...prev,
                        status: newValue
                      }));
                    }}
                    id="Status"
                  />
                </Grid>


                <Grid item xs={12} sm={12} md={12} lg={6} xl={6} xxl={6} className="mt-3">
                  <TextField id="ResonForLeave" label="Reson For Leave" variant="outlined" size="small" value={filterCriteria.reason_for_leave} fullWidth onChange={(e, newValue) => {
                    setFilterCriteria((prev) => ({
                      ...prev,
                      reason_for_leave: e.target.value || ''
                    }));
                  }} />
                </Grid>

                <Grid item xs={12} sm={12} md={12} lg={6} xl={6} xxl={6} className="mt-3">
                  <Autocomplete
                    disablePortal
                    options={totalDayes}
                    renderInput={(params) => <TextField {...params} label="Total Days" />}
                    size="small"
                    value={filterCriteria.total_leave_days}
                    onChange={(e, newValue) => {
                      console.log('Status', Status)
                      setFilterCriteria((prev) => ({
                        ...prev,
                        total_leave_days: newValue
                      }));

                    }}
                    id="TotalDays"
                  />
                </Grid>



                <Grid item xs={12} sm={12} md={12} lg={6} xl={6} xxl={6} className="mt-3">
                  {/* <TextField id="ResonForLeave" label="Start Date" variant="outlined" size="small" /> */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']}>
                      <DatePicker
                        label="Start Date"
                        slotProps={{ textField: { size: 'small' } }}
                        value={filterCriteria.start_date ? dayjs(filterCriteria.start_date) : null}
                        onChange={(newValue) => {
                          if (newValue) {
                            setFilterCriteria((prev) => ({
                              ...prev,
                              start_date: dayjs(newValue).format('YYYY-MM-DD')
                            }));

                          }
                        }}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={12} md={12} lg={6} xl={6} xxl={6} className="mt-3">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']} >
                      <DatePicker label="End Date"
                        slotProps={{ textField: { size: 'small' } }}
                        value={filterCriteria.end_date ? dayjs(filterCriteria.end_date) : null}
                        onChange={(newValue) => {
                          if (newValue) {
                            setFilterCriteria((prev) => ({
                              ...prev,
                              end_date: dayjs(newValue).format('YYYY-MM-DD')
                            }));

                          }
                        }} />
                    </DemoContainer>
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className="mt-3">
                  <div className="d-flex justify-content-end">
                    <Button className="btn-red mx-2" size="small" onClick={removeFilter}>Close</Button>
                    <Button className="btn-blue" size="small" onClick={handleFilter}>Apply</Button>
                  </div>
                </Grid>
              </Grid>

            </Box>
          </Popover>
        </div>

        <div>
          <IconButton className=" me-3" title="Clea filter" onClick={removeFilter}>
            <CloseIcon />
          </IconButton>

          <Link to={"/apply-leave"}>
            <Button className="btn-blue">Apply Leave</Button>
          </Link>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Date</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason for Leave</th>
            <th>Total Days</th>
            <th>Status</th>
            <th>HR Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="text-center">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "200px" }}
                >
                  <LoaderSpiner />
                </div>
              </td>
            </tr>
          ) : requests.length > 0 ? (
            requests.map((request) => (
              <tr key={request.id}>
                <td>{request.apply_date}</td>
                <td>{request.leave_type}</td>
                <td>{request.start_date}</td>
                <td>{request.end_date}</td>
                <td>{request.reason_for_leave}</td>
                <td>{request.total_leave_days}</td>
                <td>{request.status}</td>
                <td>{request.hr_note || "N/A"}</td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(request.id)}
                    disabled={deleting}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                No Leave Taken
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this leave request?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeViewLeave;
