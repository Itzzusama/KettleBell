import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import AllSet from '../../screens/auth/allSet';
import BasicInformation from '../../screens/auth/basicInformation';
import BodyMeasurements from '../../screens/auth/bodyMeasurements';
import CaloricNeeds from '../../screens/auth/caloricNeeds';
import FitnessBackground from '../../screens/auth/fitnessBackground';
import FitnessCoach from '../../screens/auth/fitnessCoach';
import FitnessGoal from '../../screens/auth/fitnessGoal';
import ForgotPassword from '../../screens/auth/forgotPassword';
import HealthInformation from '../../screens/auth/healthInformation';
import Login from '../../screens/auth/loginScreen';
import Nutrition from '../../screens/auth/nutrition';
import OnboardingScreen from '../../screens/auth/onboarding';
import Otp from '../../screens/auth/otp';
import Register from '../../screens/auth/register';
import ResetPassword from '../../screens/auth/resetPassword';
import ResetSuccessFull from '../../screens/auth/resetSuccessFully';

import AccountCreated from '../../screens/auth/accountCreated';
import RouteName from '../RouteName';

const Stack = createNativeStackNavigator();

const routeMapping = [
  RouteName.Fitness_Coach,
  RouteName.Basic_Information,
  RouteName.Body_Measurements,
  RouteName.Health_Information,
  RouteName.Fitness_Background,
  RouteName.Fitness_Goal,
  RouteName.Caloric_Needs,
  RouteName.Nutrition,
  RouteName.All_Set,
];

export const AuthStack = () => {
  const { currentSection, userData } = useSelector((state) => state.progress);

  // After logout, userData is reset, and email is gone. Go to splash.
  // After signup, email is present. Go to onboarding.
  const initialRouteName = (currentSection === 0 && !userData.email)
    ? RouteName.ONBOARDING_SCREEN
    : routeMapping[currentSection] || RouteName.ONBOARDING_SCREEN;

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={RouteName.ONBOARDING_SCREEN} component={OnboardingScreen} />
      <Stack.Screen name={RouteName.LOGIN} component={Login} />
      <Stack.Screen name={RouteName.Register_Screen} component={Register} />
      <Stack.Screen name={RouteName.Forgot_password} component={ForgotPassword} />
      <Stack.Screen name={RouteName.Reset_Password} component={ResetPassword} />
      <Stack.Screen name={RouteName.Reset_SuccessFully} component={ResetSuccessFull} />
      <Stack.Screen name={RouteName.Fitness_Coach} component={FitnessCoach} />
      <Stack.Screen name={RouteName.Basic_Information} component={BasicInformation} />
      <Stack.Screen name={RouteName.Body_Measurements} component={BodyMeasurements} />
      <Stack.Screen name={RouteName.Health_Information} component={HealthInformation} />
      <Stack.Screen name={RouteName.Fitness_Background} component={FitnessBackground} />
      <Stack.Screen name={RouteName.Fitness_Goal} component={FitnessGoal} />
      <Stack.Screen name={RouteName.Nutrition} component={Nutrition} />
      <Stack.Screen name={RouteName.Caloric_Needs} component={CaloricNeeds} />
      <Stack.Screen name={RouteName.All_Set} component={AllSet} />
      <Stack.Screen name={RouteName.OTP} component={Otp} />
      <Stack.Screen name={RouteName.Account_Created} component={AccountCreated} />

    </Stack.Navigator>
  );
};
