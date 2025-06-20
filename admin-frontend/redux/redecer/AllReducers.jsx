import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loginUserData: {},
  loginUserProfile: "",
  token: null,
  TotalUsers: [],
  // TotalAttendance: "",
  AllProfilesImage:[],
};


const AllReducers = createSlice({
  
  name: "counter",
  initialState,
  reducers: {

    LoginTokenReduser: (state, { payload }) => {
      state.token = payload.token;
    },
    LoginUserReduser: (state, { payload }) => {
      delete payload.token;
      state.loginUserData = payload;
    },
    UserProfilePicReduser: (state, { payload }) => {
      // console.log(payload,"=====payload");

      state.loginUserProfile = payload;
    },
    UserEditReduser: (state, { payload }) => {
      state.loginUserData = {
        ...state.loginUserData,
        ...payload,
      };
    },
    AlluserProfileGetReduser: (state, { payload }) => { 
      state.AllProfilesImage = payload;
      // console.log(state.AllProfilesImage, "Updated state");

      
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  LoginUserReduser,
  UserProfilePicReduser,
  LoginTokenReduser,
  UserEditReduser,
  AlluserProfileGetReduser,
} = AllReducers.actions;

export default AllReducers.reducer;
