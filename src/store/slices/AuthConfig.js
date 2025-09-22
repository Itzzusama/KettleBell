import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  isOnBoarding: false,
  unseenNoti: 0,
  isExpired: false,
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
    setExpired(state, action) {
      state.isExpired = action.payload;
    },
    logout(state, action) {
      state.token = "";
    },
  },
});

export const { setToken, setOnBoarding, setUnseenNoti, logout, setExpired } =
  authConfigsSlice.actions;

export default authConfigsSlice.reducer;
