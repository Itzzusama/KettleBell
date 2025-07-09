import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSection: 0,
  totalSections: 9, // There are 9 screens in the flow
  sections: [
    { id: 0, name: 'Welcome', completed: false }, // FitnessCoach
    { id: 1, name: 'Basic Info', completed: false }, // BasicInformation
    { id: 2, name: 'Body Measurements', completed: false }, // BodyMeasurements
    { id: 3, name: 'Health Info', completed: false }, // HealthInformation
    { id: 4, name: 'Fitness Background', completed: false }, // FitnessBackground
    { id: 5, name: 'Fitness Goal', completed: false }, // FitnessGoal
    { id: 6, name: 'Caloric Needs', completed: false }, // CaloricNeeds
    { id: 7, name: 'Nutrition', completed: false }, // Nutrition
    { id: 8, name: 'Summary', completed: false }, // AllSet
  ],
  userData: {
    profilePicture: null,
    setupComplete: false,
  },
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setCurrentSection: (state, action) => {
      state.currentSection = action.payload;
    },
    nextSection: (state) => {
      if (state.sections[state.currentSection]) {
        state.sections[state.currentSection].completed = true;
      }
      if (state.currentSection < state.totalSections - 1) {
        state.currentSection += 1;
      }
    },
    previousSection: (state) => {
      if (state.currentSection > 0) {
        state.currentSection -= 1; 
      }
    },
    updateUserData: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    resetProgress: (state) => {
      Object.assign(state, initialState);
    },
    setSetupComplete: (state, action) => {
      state.userData.setupComplete = action.payload;
    },
  },
});

export const {
  setCurrentSection,
  nextSection,
  previousSection,
  updateUserData,
  resetProgress,
  setSetupComplete,
} = progressSlice.actions;

export default progressSlice.reducer;