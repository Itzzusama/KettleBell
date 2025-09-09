import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  isOnBoarding: false,
  unseenNoti: 0,
};
export const authConfigsSlice = createSlice({
  name: "authConfigs",
  initialState: initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
    setOnBoarding(state, action) {
      state.isOnBoarding = action.payload;
    },
    setUnseenNoti(state, action) {
      state.unseenNoti = action.payload;
    },
    logout(state, action) {
      state.token = "";
    },
  },
});

export const { setToken, setOnBoarding, setUnseenNoti, logout } =
  authConfigsSlice.actions;

export default authConfigsSlice.reducer;
