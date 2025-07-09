import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/auth/splashScreen";
import { AuthStack } from "./auth";
import MainStack from "./main";
import RouteName from "./RouteName";

const Stack = createNativeStackNavigator();

const Rootnavigator = () => {
  return (
    <Stack.Navigator initialRouteName={RouteName.SPLASH_SCREEN} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={RouteName.SPLASH_SCREEN} component={SplashScreen} />
      <Stack.Screen name={RouteName.AuthStack} component={AuthStack} />
      <Stack.Screen name={RouteName.MainStack} component={MainStack} />
    </Stack.Navigator>
  );
};

export default Rootnavigator;
