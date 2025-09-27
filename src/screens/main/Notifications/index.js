import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";

import ScreenWrapper from "../../../components/ScreenWrapper";
import Header from "../../../components/Header";

import Item from "./molecules/Item";

import { COLORS } from "../../../utils/COLORS";
import { useIsFocused, useNavigation } from "@react-navigation/native";

import moment from "moment";
import { GetApiRequest, PutApiRequest } from "../../../services/api";
import NoData from "../../../components/NoData";
import { useDispatch } from "react-redux";
import { setUnseenNoti } from "../../../store/slices/AuthConfig";

const Notifications = () => {
  const isFocus = useIsFocused();

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dispatch = useDispatch();
  const getNotification = async () => {
    setLoading(true);
    try {
      const response = await GetApiRequest("api/notifications");

      setNotifications(response.data?.data);
    } catch (error) {
      console.log("err", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const markRead = async () => {
    try {
      const response = await PutApiRequest("api/notifications/read-all");
      if (response?.data?.success) {
        dispatch(setUnseenNoti(response?.data?.unreadCount));
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getNotification();
    markRead();
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
              subtitle={"All New Notifications Will Appear here"}
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
