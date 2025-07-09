import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import authConfigsReducer from './slices/AuthConfig';
import mealPlanReducer from './slices/mealPlanSlice';
import progressSlice from './slices/progressSlice';
import recipesReducer from './slices/recipesSlice';
import usersSlice from './slices/usersSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  authConfigs: authConfigsReducer,
  users: usersSlice,
  progress: progressSlice,
  recipes: recipesReducer,
  mealPlan: mealPlanReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);


