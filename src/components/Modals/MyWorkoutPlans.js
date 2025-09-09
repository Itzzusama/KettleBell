import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

import CustomButton from "../CustomButton";
import CustomModal from "../CustomModal";
import CustomText from "../CustomText";

import { COLORS } from "../../utils/COLORS";
import fonts from "../../assets/fonts";
import { GetApiRequest } from "../../services/api";

const MyWorkoutPlans = ({
  isVisible,
  onDisable,
  onPress,
  loading,
  plan,
  setPlan,
  type,
}) => {
  const [myPlans, setMyPlans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getMyWorkoutPlan = async () => {
    setRefreshing(true);
    try {
      const api =
        type == "meal"
          ? "api/meal-plans/my-meal-plans"
          : "api/workout-plans/my-plans";

      const response = await GetApiRequest(api);

      setMyPlans(type == "meal" ? response.data : response.data?.data);
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getMyWorkoutPlan();
  }, [type]);

  return (
    <CustomModal
      backdropOpacity={0.8}
      isVisible={isVisible}
      onDisable={onDisable}
    >
      <ScrollView contentContainerStyle={styles.mainContainer}>
        <CustomText
          label={type == "meal" ? "My Meal Plans" : "My Workout Plans"}
          fontFamily={fonts.bold}
          fontSize={18}
          color={COLORS.primaryColor}
          marginBottom={25}
        />
        <View style={styles.border}>
          {refreshing ? (
            <ActivityIndicator size="large" color={COLORS.primaryColor} />
          ) : (
            <>
              {myPlans?.map((item, index) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => {
                    setPlan(item._id);
                  }}
                  style={{
                    height: 150,
                    width: "100%",
                    marginBottom: 6,
                    borderRadius: 12,
                    paddingBottom: 12,
                    borderWidth: 1,
                    borderColor: COLORS.gray,
                    backgroundColor: plan === item._id && COLORS.primaryColor,
                  }}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: type == "meal" ? item?.banner : item?.images[0],
                      }}
                      style={styles.image}
                    />
                  </View>

                  <CustomText
                    label={item?.name}
                    marginLeft={12}
                    marginTop={4}
                  />
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
        <View style={styles.row}>
          <CustomButton
            title="Cancel"
            backgroundColor="transparent"
            color={COLORS.primaryColor}
            borderColor={COLORS.primaryColor}
            borderWidth={1}
            width="48%"
            onPress={onDisable}
          />
          <CustomButton
            title="Select Plan"
            width="48%"
            backgroundColor={COLORS.primaryColor}
            onPress={() => {
              if (plan != "") {
                onPress();
              } else {
                alert("Please select a plan.");
              }
            }}
            loading={loading}
          />
        </View>
      </ScrollView>
    </CustomModal>
  );
};

export default MyWorkoutPlans;

const styles = StyleSheet.create({
  mainContainer: {
    padding: 25,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignItems: "center",
    paddingTop: 35,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 5,
  },
  border: {
    borderTopWidth: 0.3,
    borderTopColor: COLORS.gray,
    paddingTop: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainer: {
    height: 120,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 6,
  },
  image: {
    height: "100%",
    width: "100%",
    borderRadius: 6,
    overflow: "hidden",
  },
});
