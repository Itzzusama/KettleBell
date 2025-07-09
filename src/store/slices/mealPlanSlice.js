import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mealPlan: null,
  weekSchedule: [],
  loading: false,
  error: null,
};

const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    setMealPlanData: (state, action) => {
      state.mealPlan = action.payload.mealPlan;
      state.weekSchedule = action.payload.weekSchedule;
    },
  },
});

export const { setMealPlanData } = mealPlanSlice.actions;

export default mealPlanSlice.reducer;
