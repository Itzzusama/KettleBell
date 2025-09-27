"use client";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../../../../assets/fonts";
import { Images } from "../../../../assets/images";
import RouteName from "../../../../navigation/RouteName";
import {
  GetApiRequest,
  DeleteApiRequest,
  PutApiRequest,
} from "../../../../services/api";
import { COLORS } from "../../../../utils/COLORS";

export default function ClientScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const { t } = useTranslation();
  const [client, setClient] = useState([]);
  const isFocus = useIsFocused();

  const handleAddClient = () => {
    navigation.navigate(RouteName.AddClient);
  };

  const handleClientPress = (client) => {
    navigation.navigate(RouteName.Client_Progress, { client });
  };

  const getapirequest = async () => {
    try {
      const res = await GetApiRequest("api/clients");

      setClient(
        res.data?.data.map((item) => {
          let filledSections = 0;

          const basicInfoFilled =
            item.basicInfo &&
            Object.values(item.basicInfo).some(
              (v) =>
                v !== null &&
                v !== "" &&
                v !== undefined &&
                !(Array.isArray(v) && v.length === 0)
            );
          if (basicInfoFilled) filledSections++;

          const fitnessGoalsFilled =
            item.fitnessGoals &&
            ((item.fitnessGoals.primaryGoal &&
              item.fitnessGoals.primaryGoal !== null &&
              item.fitnessGoals.primaryGoal !== "") ||
              (Array.isArray(item.fitnessGoals.specificGoals) &&
                item.fitnessGoals.specificGoals.length > 0));
          if (fitnessGoalsFilled) filledSections++;

          const healthInfoFilled =
            item.healthInfo &&
            ((Array.isArray(item.healthInfo.medicalConditions) &&
              item.healthInfo.medicalConditions.length > 0) ||
              (Array.isArray(item.healthInfo.injuriesOrLimitations) &&
                item.healthInfo.injuriesOrLimitations.length > 0));
          if (healthInfoFilled) filledSections++;

          let consistency = 0;
          if (filledSections === 1) consistency = 33;
          else if (filledSections === 2) consistency = 66;
          else if (filledSections === 3) consistency = 100;

          return {
            id: item._id,
            name: item.name,
            image: item.avatar,
            status: item.onboardingCompleted ? "Onboarded" : "Not Onboarded",
            isActive: item.isActive,
            consistency,
            isVerified: item.isVerified,
          };
        })
      );
    } catch (error) {
      console.log("error", error);
    }
  };

  const toggleClientStatus = async (id, isActive) => {
    try {
      await PutApiRequest(`api/clients/${id}`, { isActive: !isActive });
      getapirequest();
    } catch (error) {
      console.log("toggle error", error);
    }
  };

  const deleteClient = async (id) => {
    Alert.alert(
      "Delete Client",
      "Are you sure you want to delete this client?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await DeleteApiRequest(`api/clients/${id}`);
              getapirequest();
            } catch (error) {
              console.log("delete error", error);
            }
          },
        },
      ]
    );
  };
  const verifyClient = async (id) => {
    try {
      await PutApiRequest(`api/clients/${id}`, { isVerified: true });
      getapirequest();
    } catch (error) {
      console.log("verify error", error);
    }
  };
  useEffect(() => {
    getapirequest();
  }, [isFocus]);

  const filteredClients = client.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={wp(6.5)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("Client.title")}</Text>
        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={handleAddClient}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={wp(5)} color={COLORS.white} />
            <TextInput
              style={styles.searchInput}
              placeholder={t("Client.placeholder")}
              placeholderTextColor={COLORS.white}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Client Count */}
        <View style={styles.clientCountContainer}>
          <Text style={styles.clientCountText}>
            {client.length} {t("Client.clients")}
          </Text>
        </View>

        {/* Client List */}
        <View style={styles.clientList}>
          {filteredClients?.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientCard}
              onPress={() => handleClientPress(client)}
              activeOpacity={0.7}
            >
              {/* Info Section */}
              <View style={styles.clientInfo}>
                {client.image ? (
                  <Image
                    source={{ uri: client.image }}
                    style={styles.clientImage}
                  />
                ) : (
                  <View style={[styles.clientImage, styles.placeholderImage]}>
                    <Image source={Images.dumyImg} style={styles.clientImage} />
                  </View>
                )}
                <View style={styles.clientDetails}>
                  <View style={styles.clientHeader}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{client.status}</Text>
                    </View>
                  </View>
                  <View style={styles.consistencyContainer}>
                    <Text style={styles.consistencyLabel}>
                      {t("Client.Consistency")}
                    </Text>
                    <View style={styles.progressContainer}>
                      <Progress.Bar
                        progress={client.consistency / 100}
                        width={wp(20)}
                        height={hp(0.8)}
                        color={COLORS.primaryColor}
                        unfilledColor={COLORS.white}
                        borderWidth={0}
                        borderRadius={hp(0.4)}
                      />
                      <Text style={styles.progressText}>
                        {client.consistency}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Chat icon (top-right) */}
              <TouchableOpacity
                style={styles.messageBadge}
                onPress={() =>
                  navigation.navigate(RouteName.InboxScreen, { client })
                }
              >
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>

              {/* Footer actions */}
              <View style={styles.cardFooter}>
                {!client.isVerified ? (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.footerButton,
                        {
                          backgroundColor: COLORS.primaryColor,
                        },
                      ]}
                      onPress={() => verifyClient(client.id)}
                    >
                      <Text style={styles.footerButtonText}>Verify</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.footerButton,
                        {
                          backgroundColor: COLORS.primaryColor,
                        },
                      ]}
                      onPress={() => deleteClient(client.id)}
                    >
                      <Text style={styles.footerButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.footerButton,
                        {
                          backgroundColor: client.isActive
                            ? "#E53935"
                            : "#4CAF50",
                        },
                      ]}
                      onPress={() =>
                        toggleClientStatus(client.id, client.isActive)
                      }
                    >
                      <Text style={styles.footerButtonText}>
                        {client.isActive ? "Deactivate" : "Activate"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.footerButton,
                        {
                          backgroundColor: COLORS.primaryColor,
                        },
                      ]}
                      onPress={() => deleteClient(client.id)}
                    >
                      <Text style={styles.footerButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingTop: hp(6),
    paddingBottom: 105,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  backButton: {
    padding: wp(2.5),
  },
  headerTitle: {
    color: "#FFF",
    fontSize: hp(2.3),
    textAlign: "center",
    flex: 1,
    fontFamily: fonts.medium,
  },
  headerAddButton: {
    backgroundColor: COLORS.primaryColor,
    borderRadius: 20,
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2.5),
    marginTop: hp(1),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(29, 29, 32, 1)",
    borderRadius: wp(2.5),
    paddingHorizontal: wp(3.5),
    borderWidth: 1,
    borderColor: COLORS.gray3,
    height: hp(7),
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    marginLeft: wp(2.5),
    fontFamily: fonts.regular,
    top: 2,
  },
  clientCountContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  clientCountText: {
    fontSize: hp(1.8),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },
  clientList: {
    paddingHorizontal: wp(4),
  },
  clientCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: wp(3),
    padding: hp(1.5),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  clientImage: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    marginRight: wp(3),
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  clientDetails: {
    flex: 1,
  },
  clientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
  },
  clientName: {
    fontSize: hp(1.6),
    fontFamily: fonts.regular,
    color: COLORS.white,
    marginRight: wp(2),
  },
  statusBadge: {
    backgroundColor: "#FFF4D8",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(1),
  },
  statusText: {
    fontSize: hp(1.2),
    fontFamily: fonts.regular,
    color: COLORS.black2,
  },
  consistencyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  consistencyLabel: {
    fontSize: hp(1.4),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    marginRight: wp(2),
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressText: {
    fontSize: hp(1.4),
    fontFamily: fonts.regular,
    color: COLORS.gray2,
    marginLeft: wp(2),
  },
  messageBadge: {
    position: "absolute",
    top: hp(1.5),
    right: wp(3),
    backgroundColor: COLORS.primaryColor,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: hp(1.2),
    gap: wp(2),
  },

  footerButtonPrimary: {
    flex: 1,
    backgroundColor: COLORS.primaryColor,
    paddingVertical: hp(1),
    borderRadius: wp(2),
    alignItems: "center",
  },

  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(2),
    minWidth: wp(20),
    justifyContent: "center",
  },

  footerButtonOutline: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E53935",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(2),
    justifyContent: "center",
  },

  footerButtonText: {
    fontSize: hp(1.4),
    fontFamily: fonts.medium,
    color: COLORS.white,
  },

  footerButtonDelete: {
    fontSize: hp(1.4),
    fontFamily: fonts.medium,
    color: "#E53935",
  },
});
