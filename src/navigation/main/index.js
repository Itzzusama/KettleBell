import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import ExerciseComplete from '../../screens/main/exerciseComplete';
import ExerciseDetail from '../../screens/main/exerciseDetail';
import KettlebellSwing from '../../screens/main/exerciseDetail2';
import ExerciseStart from '../../screens/main/exerciseStart';
import AddRecipe from '../../screens/main/instructorScreens/addRecipe';
import ClientExercise from '../../screens/main/instructorScreens/clientExercise';
import ClientExerciseDetail from '../../screens/main/instructorScreens/clientExerciseDetail';
import ClientExerciseStart from '../../screens/main/instructorScreens/clientExerciseStart';
import ClientMeal from '../../screens/main/instructorScreens/clientMeal';
import ClientMealDetail from '../../screens/main/instructorScreens/ClientMealDetail';
import ClientMessage from '../../screens/main/instructorScreens/ClientMessage';
import ClientProfile from '../../screens/main/instructorScreens/clientProfile';
import ClientProgress from '../../screens/main/instructorScreens/clientProgress';
import ClientRecipe from '../../screens/main/instructorScreens/clientRecipe';
import ClientRecipeDetail from '../../screens/main/instructorScreens/clientRecipeDetail';
import ClientWorkoutPlan from '../../screens/main/instructorScreens/clientWorkoutPlan';
import CreateExercise from '../../screens/main/instructorScreens/createExercise';
import createMeal from '../../screens/main/instructorScreens/createMeal';
import CreateNewRecipe from '../../screens/main/instructorScreens/createNewPlan';
import CreateWorkoutPlans from '../../screens/main/instructorScreens/createWorkoutPlan';
import DayDetail from '../../screens/main/instructorScreens/dayDetail';
import MealDetail from '../../screens/main/mealDetail';
import Message from '../../screens/main/message';
import YourRecipes from '../../screens/main/receipe';
import RecipeDetail from '../../screens/main/receipeDetail';
import RecipeTime from '../../screens/main/recipeTime';
import RecipeTime2 from '../../screens/main/recipeTime2';
import UpdatedPassword from '../../screens/main/updatedPassword';
import WorkoutPlanDetails from '../../screens/main/workoutPlanDetails';
import InstructorTabs from '../instructorTabs';
import RouteName from '../RouteName';
import TabStack from '../tabs';
import AddClient from '../../screens/main/instructorTabs/client/AddClient';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const role = useSelector((state) => state.users.role);
  console.log("User role:", role); // Debugging

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === "coach" ? (
        <Stack.Screen name={RouteName.Instructor_Tabs} component={InstructorTabs} />
      ) : (
        <Stack.Screen name={RouteName.TABS} component={TabStack} />
      )}
      <Stack.Screen name={RouteName.WorkoutPlans_Details} component={WorkoutPlanDetails} />
      <Stack.Screen name={RouteName.Exercise_Detail} component={ExerciseDetail} />
      <Stack.Screen name={RouteName.Exercise_Detail2} component={KettlebellSwing} />
      <Stack.Screen name={RouteName.Exercise_Start} component={ExerciseStart} />
      <Stack.Screen name={RouteName.Exercise_Complete} component={ExerciseComplete} />
      <Stack.Screen name={RouteName.Receipes} component={YourRecipes} />
      <Stack.Screen name={RouteName.Receipe_Detail} component={RecipeDetail} />
      <Stack.Screen name={RouteName.Recipe_Time} component={RecipeTime} />
      <Stack.Screen name={RouteName.Recipe_Time2} component={RecipeTime2} />
      <Stack.Screen name={RouteName.Meal_Detail} component={MealDetail} />
      <Stack.Screen name={RouteName.Message_screen} component={Message} />
      <Stack.Screen name={RouteName.Create_Workout_plan} component={CreateWorkoutPlans} />
      <Stack.Screen name={RouteName.CLient_workout_plan} component={ClientWorkoutPlan} />
      <Stack.Screen name={RouteName.Day_Details} component={DayDetail} />
      <Stack.Screen name={RouteName.Client_exercise} component={ClientExercise} />
      <Stack.Screen name={RouteName.Create_Exercise} component={CreateExercise} />
      <Stack.Screen name={RouteName.Client_Exercise_Detail} component={ClientExerciseDetail} />
      <Stack.Screen name={RouteName.Client_Recipe} component={ClientRecipe} />
      <Stack.Screen name={RouteName.Add_Recipe} component={AddRecipe} />
      <Stack.Screen name={RouteName.Client_Recipe_Detail} component={ClientRecipeDetail} />
      <Stack.Screen name={RouteName.Create_New_Recipe} component={CreateNewRecipe} />
      <Stack.Screen name={RouteName.Client_Meal_Detail} component={ClientMealDetail} />
      <Stack.Screen name={RouteName.Client_Exercise_Start} component={ClientExerciseStart} />
      <Stack.Screen name={RouteName.Client_profile} component={ClientProfile} />
      <Stack.Screen name={RouteName.Client_Progress} component={ClientProgress} />
      <Stack.Screen name={RouteName.Client_Message} component={ClientMessage} />
      <Stack.Screen name={RouteName.Update_Password} component={UpdatedPassword} />
      <Stack.Screen name={RouteName.Client_Meal} component={ClientMeal} />
      <Stack.Screen name={RouteName.Create_Meal} component={createMeal} />
      <Stack.Screen name={RouteName.AddClient} component={AddClient} />
    </Stack.Navigator>
  );
};

export default MainStack;