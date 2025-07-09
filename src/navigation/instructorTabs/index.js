import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Platform, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import fonts from '../../assets/fonts/index.js';
import { Icons } from '../../assets/icons/index.js';
import Client from '../../screens/main/instructorTabs/client';
import InstructorHome from '../../screens/main/instructorTabs/home';
import InstructorNutrition from '../../screens/main/instructorTabs/nutrition';
import Plans from '../../screens/main/instructorTabs/plan';
import { COLORS } from '../../utils/COLORS';

const Tab = createBottomTabNavigator();

const InstructorTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={() => ({
        tabBarLabelStyle: {
          fontSize: wp(3),
          fontFamily: fonts.regular,
        },
        tabBarStyle: {
          height: Platform.OS === 'android' ? hp(9) + insets.bottom : hp(11),
          backgroundColor: COLORS.backgroundColor || '#1A1A1A',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingBottom: Platform.OS === 'android' ? hp(1.5) : insets.bottom + hp(1),
          paddingTop: hp(1.2),
          borderTopWidth: 1,
          borderTopColor: COLORS.gray || '#2A2A2A',
          borderTopLeftRadius: wp(5),
          borderTopRightRadius: wp(5),
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.primaryColor || '#FFA726',
        tabBarInactiveTintColor: '#5C5C60',
        headerShown: false,
        tabBarSafeAreaInsets: {
          bottom: 0,
        },
      })}
    >
      <Tab.Screen
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={{ 
              justifyContent: 'center', 
              alignItems: 'center',
              width: wp(8),
              height: wp(8),
            }}>
              <Image 
                source={Icons.home} 
                style={{ 
                  width: wp(5), 
                  height: wp(5), 
                  tintColor: color,
                  resizeMode: 'contain' 
                }} 
              />
            </View>
          ),
        }}
        name="Home"
        component={InstructorHome}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={{ 
              justifyContent: 'center', 
              alignItems: 'center',
              width: wp(8),
              height: wp(8),
            }}>
              <Image 
                source={Icons.plan} 
                style={{ 
                  width: wp(5), 
                  height: wp(5), 
                  tintColor: color,
                  resizeMode: 'contain' 
                }} 
              />
            </View>
          ),
        }}
        name="Plans"
        component={Plans}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={{ 
              justifyContent: 'center', 
              alignItems: 'center',
              width: wp(8),
              height: wp(8),
            }}>
              <Image 
                source={Icons.nutrition} 
                style={{ 
                  width: wp(5), 
                  height: wp(5), 
                  tintColor: color,
                  resizeMode: 'contain' 
                }} 
              />
            </View>
          ),
        }}
        name="Nutrition"
        component={InstructorNutrition}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={{ 
              justifyContent: 'center', 
              alignItems: 'center',
              width: wp(8),
              height: wp(8),
            }}>
              <Image 
                source={Icons.profileTab} 
                style={{ 
                  width: wp(5), 
                  height: wp(5), 
                  tintColor: color,
                  resizeMode: 'contain' 
                }} 
              />
            </View>
          ),
        }}
        name="Clients"
        component={Client}
      />
    </Tab.Navigator>
  );
};

export default InstructorTabs;