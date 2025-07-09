"use client";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
import { GetApiRequest } from "../../../../services/api";
import { COLORS } from "../../../../utils/COLORS";

export default function ClientScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const { t } = useTranslation();
  const [client, setClient] = useState([]);
  const isFocus = useIsFocused();

  const handleAddClient = () => {
    console.log("Add new client");
    navigation.navigate(RouteName.AddClient);
  };

  const handleClientPress = (client) => {
    console.log("Client pressed:", client.name);
    navigation.navigate(RouteName.Client_profile);
  };

  const getapirequest = async () => {
    try {
      const res = await GetApiRequest("api/clients");
      setClient(
        res.data.data.map((item) => ({
          id: item._id,
          name: item.name,
          image: item.avatar, // Avatar might be null
          status: item.onboardingCompleted ? "Onboarded" : "Not Onboarded", // Map API field to status
          consistency: item.consistencyPercentage, // Use API consistency field
        }))
      );
    } catch (error) {
      console.log("error", error);
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
            >
              <View style={styles.clientInfo}>
                {client.image ? (
                  <Image
                    source={{ uri: client.image }}
                    style={styles.clientImage}
                  />
                ) : (
                  <View style={[styles.clientImage, styles.placeholderImage]}>
                    ]
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
                        width={wp(25)}
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
              <View style={styles.clientActions}>
                <TouchableOpacity style={styles.messageBadge}>
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons
                    name="chevron-forward"
                    size={hp(2.5)}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
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
    fontSize: 12,
    marginLeft: wp(2.5),
    fontFamily: fonts.regular,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.darkGray,
    borderRadius: wp(3),
    padding: hp(2),
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
  placeholderText: {
    color: COLORS.white,
    fontSize: hp(1.4),
    fontFamily: fonts.regular,
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
    color: COLORS.gray2,
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
  clientActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageBadge: {
    backgroundColor: COLORS.primaryColor,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
  },
});
