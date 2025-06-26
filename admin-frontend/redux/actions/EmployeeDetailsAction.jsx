import axios from "axios";
import {
  TotalAttendanceReduser,
  GetAttendanceIdReduser,
  GetAttendanceIdAndDateReducer,
  TotalLeaveEmployeeReducer,
  TotalLeaveEmployeeReducerById,
  TotalUserReduser,
  TotalUserReduserByUserId,
  TotalAttendanceReduserByDate,
  fetchAllNotificationsReduser,
  GetSpecificUserCahtsReduser,
  GetUnseenUserCountReduser,
} from "../redecer/EmployeeDetailReducers";

export const AddNewEmployeeAction = (userData, callback) => async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_REGISTER}`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    if (response) {
      callback(response);
    }

    return response;
  } catch (error) {
    console.error("Error performing action", error);
  }
};
export const GetTotalUserAction = () => async (dispatch) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_CUSTOM_USERS}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    const users = response.data.data;
    // console.log(users,"===========================");
    
    dispatch(TotalUserReduser(users));
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const GetTotalUserActionByUserId = () => async (dispatch) => {
  try {
    const userId = localStorage.getItem("user_id");
    const response = await axios.get(
      `http://localhost:5000/api/auth/get-user-by-id/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    const users = response.data.data;
    dispatch({ type: "SET_USER_BY_ID", payload: users });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const GetAttendanceDataAction = () => async (dispatch) => {
  try {
    const attendanceResponse = await axios.get(
      `${import.meta.env.VITE_API_GET_ATTENDANCE}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    const attendanceData = attendanceResponse.data || [];
    dispatch(TotalAttendanceReduser(attendanceData));
    return attendanceData;
  } catch (error) {
    console.error("Error fetching present count:", error);
  }
};
// get attendance data only current date

export const GetAttendanceDataActionByDate = (viewDate) => async (dispatch) => {
  const currentDate = new Date().toISOString().split("T")[0];
  try {
    const attendanceResponse = await axios.get(
      `http://localhost:5000/api/attendance/attendance-get-by-date/${viewDate}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    const attendanceData = attendanceResponse.data.data || [];
    dispatch(TotalAttendanceReduserByDate(attendanceData));
    return attendanceData;
  } catch (error) {
    console.error("Error fetching present count:", error);
  }
};

export const GetAttendanceDataActionById =
  (month, year) => async (dispatch) => {
    const formattedMonth = month.toString().padStart(2, "0");
    try {
      const attendanceResponse = await axios.get(
        `http://localhost:5000/api/attendance/get-Attendance-by-id?month=${formattedMonth}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      const attendanceData = attendanceResponse.data.data || [];

      dispatch(GetAttendanceIdReduser(attendanceData));
      return attendanceData;
    } catch (error) {
      console.error("Error fetching present count:", error);
    }
  };
export const GetAttendanceDataActionByIdAndDate = () => async (dispatch) => {
  const userId = localStorage.getItem("user_id");
  const currentDate = new Date().toISOString().split("T")[0];
  try {
    const attendanceResponse = await axios.get(
      `http://localhost:5000/api/attendance/get-attendance-date/${userId}/${currentDate}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );

    const attendanceData = attendanceResponse.data.data || [];
    dispatch(GetAttendanceIdAndDateReducer(attendanceData));
    return attendanceData;
  } catch (error) {
    console.error("Error fetching present count:", error);
  }
};

export const GetEmployeeLeaveDetailAction = () => async (dispatch) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_LEAVE}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
      },
    });
    const users = response.data;
    // console.log(users,"employ");

    dispatch(TotalLeaveEmployeeReducer(users));

    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const GetEmployeeLeaveDetailActionById = () => async (dispatch) => {
  const userId = localStorage.getItem("user_id");
  const currentDate = new Date().toISOString().split("T")[0];
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_LEAVE}/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    const users = response.data;
    // console.log(users,"employ");

    dispatch(TotalLeaveEmployeeReducerById(users));

    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const submitAttendanceAction = (payload) => async (dispatch) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/attendance/mark-attendance`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );

    return response.data; // return the response so it can be awaited
  } catch (error) {
    console.error("Error performing action", error);
    // toast.error("An error occurred. Please try again.");
  }
};

export const LeaveRequestChangeAction = (payload) => async (dispatch) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_LEAVE}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error performing action", error);
  }
};

export const GetEmpPersonalInfoAction = () => async (dispatch) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_PERSONAL_INFO}`
    );

    dispatch({
      type: "EmployeeDetail/GetEmployeeInfoReducer",
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    console.error("Error performing action", error);
  }
};

// Holi days List Get

export const GetHolidayAction = () => async (dispatch) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_HOLIDAYS}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
      },
    });

    dispatch({
      type: "EmployeeDetail/TotalHolidaysReducer",
      payload: response.data, // Ensure this has the correct data structure
    });

    // console.log(response.data, "Data from API ===========");

    return response.data; // Ensure this returns data correctly
  } catch (error) {
    console.error("Error performing action", error);
  }
};

export const GetLeavePolicyAction = () => async (dispatch) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_LEAVE_POLICIES}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );

    dispatch({
      type: "EmployeeDetail/TotalLeavePolicyReducer",
      payload: response.data, // Ensure this has the correct data structure
    });

    // console.log(response.data, "Data from API ===========");

    return response.data; // Ensure this returns data correctly
  } catch (error) {
    console.error("Error performing action", error);
  }
};

export const GetOfficeShiftsAction = () => async (dispatch) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_SHIFTS}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
      },
    });
    if (response?.data) {
      dispatch({
        type: "EmployeeDetail/TotalOfficeShiftsReducer",
        payload: response.data, // Ensure this has the correct data structure
      });
    }

    // console.log(response.data, "Data from API ===========");

    return response.data; // Ensure this returns data correctly
  } catch (error) {
    console.error("Error performing action", error);
  }
};

export const fetchNotificationsAll =
  (page, callback) => async (dispatch) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_NOTIFICATION}?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );

      if (response?.data) {
        dispatch(fetchAllNotificationsReduser(response.data));

        callback(response.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

export const changeReadUnreadAction =
  (notificationId, callback) => async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_NOTIFICATION}/${notificationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      if (response.data) {
        callback(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error performing action", error);
    }
  };

export const GetSpecificUserCahts =
  (selecteduserid, pageNum, callback) => async (dispatch) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_CHATTING
        }?receiver_id=${selecteduserid}&page=${pageNum}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      if (response?.data) {
        dispatch(GetSpecificUserCahtsReduser(response.data));

        callback(response.data);
      }

      return response.data;
    } catch (error) {
      console.error("Error performing action", error);
    }
  };
export const messageSentSpecificUser = (payload, callback) => async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_CHATTING}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    if (response.data) {
      callback(response.data);
    }

    return response.data;
  } catch (error) {
    console.error("Error performing action", error);
  }
};
export const unseenUserandMessagecount = (callback) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_UNSEEN_USER_AND_MESSAGE_COUNT}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    if (response?.data) {
      dispatch(GetUnseenUserCountReduser(response.data));

      callback(response.data);
    }

    return response.data;
  } catch (error) {
    console.error("Error performing action", error);
  }
};
export const readMessageOnSelectUser = (messageIds, callback) => async () => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_CHATTING}`,
      { messageIds },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    if (response.data) {
      callback(response.data);
    }

    return response.data;
  } catch (error) {
    console.error("Error performing action", error);
  }
};