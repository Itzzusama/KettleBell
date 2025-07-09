import { createSlice } from '@reduxjs/toolkit';

export const usersSlice = createSlice({
  name: 'users',
  initialState: {
    userData: {},
    location: {},
    unseenBadge: {},
    role: null, // Add role to initial state
  },
  reducers: {
    setUserData(state, action) {
      state.userData = action.payload;
      // Set role if provided in userData
      if (action.payload?.role) {
        state.role = action.payload.role;
      }
    },
    setLocation(state, action) {
      state.location = action.payload;
    },
    setUnseenBadge(state, action) {
      state.unseenBadge = action.payload;
    },
    setUserRole(state, action) {
      state.role = action.payload; // Explicit action to set role
    },
    clearUserData(state) {
      state.userData = {};
      state.location = {};
      state.unseenBadge = {};
      state.role = null; // Reset role on logout
    },
  },
});

export const { setUserData, setLocation, setUnseenBadge, setUserRole, clearUserData } = usersSlice.actions;

export default usersSlice.reducer;