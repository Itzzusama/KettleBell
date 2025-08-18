import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";

import ScreenWrapper from "../../../components/ScreenWrapper";
import Header from "../../../components/Header";

import Item from "./molecules/Item";

import { Images } from "../../../assets/images";
import { COLORS } from "../../../utils/COLORS";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import NoDataFound from "../../../components/NoDataFound";
import moment from "moment";
import { GetApiRequest } from "../../../services/api";
import NoData from "../../../components/NoData";

const Notifications = () => {
  const isFocus = useIsFocused();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const getNotification = async () => {
    setLoading(true);
    try {
      const response = await GetApiRequest("api/notifications");
      console.log(response?.data);
      setNotifications(response.data?.data);
    } catch (error) {
      console.log("err", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNotification();
  }, [isFocus]);

  return (
    <ScreenWrapper headerUnScrollable={() => <Header title="Notifications" />}>
      <FlatList
        data={notifications}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={getNotification} />
        }
        ListEmptyComponent={
          !loading && (
            <NoData
              title={"No Notification"}
              desc={"All New Notifications Will Appear here"}
              marginTop={170}
              iconName="notifications-off-sharp"
            />
          )
        }
        renderItem={({ item, i }) => (
          <Item
            key={i}
            title={item?.title}
            time={moment(item?.createdAt)?.fromNow()}
            desc={item?.message}
            type={item?.type}
            // onCardPress={() =>
            //   item?.type == "message"
            //     ? navigation.navigate("Chat")
            //     : item?.type == "donation"
            //     ? navigation.navigate("Donations")
            //     : item?.type == "job-apply"
            //     ? navigation.navigate("Jobs")
            //     : item?.type == "event-purchase"
            //     ? navigation.navigate("Events")
            //     : ""
            // }
          />
        )}
      />
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  line: {
    marginLeft: 12,
    width: "80%",
    height: 0.2,
    backgroundColor: COLORS.gray,
    marginVertical: 10,
  },
});
