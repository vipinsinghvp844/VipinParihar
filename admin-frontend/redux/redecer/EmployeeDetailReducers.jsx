import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  TotalUsers: [],
  TotalUsersId: [],
  TotalAttendance: [],
  TotalEmployeeInLeave: [],
  TotalEmployeeInLeaveById: [],
  submitAttendanceOnPost: [],
  GetEmployeeInfoAll: [],
  TotalHolidays: [],
  TotalLeavePolicy: [],
  TotalOfficeShifts: [],
  TotalAttendanceId: [],
  getAttendanceByDate: [],
  TotalAttendanceIdAndDate: [],
  ValueForSideBarClick: 0,
  TotalNotifications: [],
  UserSpecificChats: [],
  AllUnseenUserAndMessages:[],
};

const EmloyeeDetailSlice = createSlice({
  name: "EmployeeDetail",
  initialState,
  reducers: {
    TotalUserReduser: (state, { payload }) => {
      state.TotalUsers = [...payload];
    },
    TotalUserReduserByUserId: (state, { payload }) => {
      state.TotalUsersId = payload;
      console.log(payload, "Get by ID============");
    },
    TotalAttendanceReduser: (state, { payload }) => {
      state.TotalAttendance = [...payload];
    },
    GetAttendanceIdReduser: (state, { payload }) => {
      state.TotalAttendanceId = [...payload];
    },
    TotalAttendanceReduserByDate: (state, { payload }) => {
      state.getAttendanceByDate = [...payload];
    },
    GetAttendanceIdAndDateReducer: (state, { payload }) => {
      state.TotalAttendanceId = [...payload];
    },
    TotalLeaveEmployeeReducer: (state, { payload }) => {
      state.TotalEmployeeInLeave = [...payload];
    },
    TotalLeaveEmployeeReducerById: (state, { payload }) => {
      state.TotalEmployeeInLeaveById = [...payload];
    },
    submitAttendancePost: (state, { payload }) => {
      state.submitAttendanceOnPost = [...payload];
    },
    GetEmployeeInfoReducer: (state, { payload }) => {
      state.GetEmployeeInfoAll = payload;
      // console.log(payload,"Get============");
    },
    TotalHolidaysReducer: (state, { payload }) => {
      state.TotalHolidays = [...payload];
    },
    TotalLeavePolicyReducer: (state, { payload }) => {
      state.TotalLeavePolicy = [...payload];
    },
    TotalOfficeShiftsReducer: (state, { payload }) => {
      state.TotalOfficeShifts = [...payload];
    },
    setValueForSideBarClick: (state, action) => {
      state.ValueForSideBarClick = action.payload;
    },
    fetchAllNotificationsReduser: (state, { payload }) => {
      state.TotalNotifications = [...payload];
    },
    GetSpecificUserCahtsReduser: (state, { payload }) => {
      state.UserSpecificChats = [...payload];
    },
    GetUnseenUserCountReduser: (state, { payload }) => {
      state.AllUnseenUserAndMessages = [payload];
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  TotalUserReduser,
  TotalUserReduserByUserId,
  TotalAttendanceReduser,
  TotalLeaveEmployeeReducer,
  TotalLeaveEmployeeReducerById,
  submitAttendancePost,
  GetEmployeeInfoReducer,
  TotalHolidaysReducer,
  TotalLeavePolicyReducer,
  TotalOfficeShiftsReducer,
  GetAttendanceIdReduser,
  GetAttendanceIdAndDateReducer,
  setValueForSideBarClick,
  TotalAttendanceReduserByDate,
  fetchAllNotificationsReduser,
  GetSpecificUserCahtsReduser,
  GetUnseenUserCountReduser,
} = EmloyeeDetailSlice.actions;

export default EmloyeeDetailSlice.reducer;
