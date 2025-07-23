import axios from "axios";
import {
  LoginTokenReduser,
  LoginUserReduser,
  UserEditReduser,
  UserProfilePicReduser,
  AlluserProfileGetReduser,
  // TotalUserReduser,
  // TotalAttendanceReduser,
} from "../redecer/AllReducers";
import { toast } from "react-toastify";

const token = localStorage.getItem("authtoken");

const header = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

export const LoginUserAction = (obj12) => async (dispatch) => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_AUTH}`, {
      email: obj12.email,
      password: obj12.password,
    });

    if (res.status === 200) {
      const user = res.data;

      const userRole =
        user.user.role && user.user.role[0] ? user.user.role[0] : null;

      if (userRole) {
        localStorage.setItem("password", obj12.password);
        localStorage.setItem("authtoken", user.token);
        localStorage.setItem("user_email", user.user.email);
        localStorage.setItem("user_name", user.user.username);
        localStorage.setItem("role", user.user.role);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("user_id", user.user.id);
        dispatch(LoginTokenReduser(res?.data));
        dispatch(LoginUserReduser(res.data.user));
        return user;
      } else {
        console.error("User role is missing.");
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

export const FetchUserProfileAction = (body) => async (dispatch) => {
  try {
    const token = localStorage.getItem("authtoken");
    const profileResponse = await axios.get(
      `${import.meta.env.VITE_API_PROFILE_GET}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (profileResponse?.status == 200) {
      dispatch(
        UserProfilePicReduser(profileResponse?.data?.profile?.profile_image)
      );
      return profileResponse;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
};

export const FetchAllUserProfileAction = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("authtoken");
    const profileResponse = await axios.get(
      `${import.meta.env.VITE_API_PROFILE_GET_ALL}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (profileResponse?.status == 200) {
      dispatch(AlluserProfileGetReduser(profileResponse?.data?.data)); 
      return profileResponse?.data;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
};

export const EditUserProfileAction =
  (userInfo, user_id) => async (dispatch) => {
    try {
      const profileResponse = await axios.put(
        `${import.meta.env.VITE_API_CUSTOM_USERS}/${user_id}`,
        userInfo,
        header
      );

      if (profileResponse.status == 200) {
        dispatch(UserEditReduser(userInfo));
        return profileResponse;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

export const ProfilePicUpdateAction = (base64Image) => async (dispatch) => {
  try {
    const response = await axios.put(
      `http://localhost:5000/api/images/updateimage`,
      { base64Image },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    // console.log(response, "=====ProfilePicUpdateAction");

    if (response?.data) {
      dispatch(UserProfilePicReduser(response.data.profile.profile_image));
      return response;
    }
  } catch (error) {
    console.error("Error ProfilePicUpdateAction:", error);
  }
};
export const ProfilePicUploadAction = (base64Image) => async (dispatch) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/images/uploadimage`,
      { base64Image },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    // console.log(response, "=====ProfilePicUpdateAction");

    if (response?.data) {
      dispatch(UserProfilePicReduser(response.data.profile.profile_image));
      return response;
    }
  } catch (error) {
    console.error("Error ProfilePicUpdateAction:", error);
  }
};

export const ChangePasswordAction = (obj) => async (dispatch) => {
  try {
    const response = await axios.post(
      import.meta.env.VITE_API_CHANGE_PASSWORD,
       obj ,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log(response?.data?.message);
    toast.success(response?.data?.message);

    return response;
  } catch (error) {
    if (error) {
      toast.error(error?.response?.data?.message);
      // console.log(error.response.data, "======error.response.data");
    }
  }
};
