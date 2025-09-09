import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import fonts from "../assets/fonts";
import { COLORS } from "../utils/COLORS";

const chartConfig = {
  backgroundColor: COLORS.darkGray,
  backgroundGradientFrom: COLORS.darkGray,
  backgroundGradientTo: COLORS.darkGray,
  decimalPlaces: 0,
  color: () => "#ffffff",
  labelColor: () => "#ffffff",
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: 2,
    stroke: "#ffc107",
    fill: "#242427",
  },
  propsForBackgroundLines: {
    strokeDasharray: "",
    stroke: "#444",
    strokeWidth: 1,
  },
};

const ClientReportChart = ({ dashboardData }) => {
  const { t } = useTranslation();

  const getLastSixMonths = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(months[d.getMonth()]);
    }

    return result;
  };

  const defaultData = {
    labels: getLastSixMonths(),
    datasets: [
      {
        data: Array(6).fill(0),
        color: () => "#ffc107",
        strokeWidth: 2,
      },
    ],
    legend: ["New Clients"],
  };

  const generateChartData = () => {
    if (!dashboardData?.monthlyProgress?.newClients) {
      return defaultData;
    }

    const workouts = dashboardData.monthlyProgress.newClients.slice(-6);
    const labels = workouts.map((item) => item.month);
    const data = workouts.map((item) => item.count);

    return {
      labels,
      datasets: [
        {
          data,
          color: () => "#ffc107",
          strokeWidth: 3,
        },
      ],
      legend: ["New Clients"],
    };
  };

  const chartData = generateChartData();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("InstructorHome.clientReport")}</Text>
      <LineChart
        data={chartData}
        width={wp(90)}
        height={hp(32)}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots={true}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={false}
        yAxisLabel=""
        yAxisSuffix=""
        formatYLabel={(value) => `${parseInt(value)}`}
        yLabelsOffset={15}
        segments={6}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 16,
    padding: wp(4),
    marginHorizontal: wp(5),
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "600",
    marginBottom: hp(2),
    alignSelf: "flex-start",
    fontFamily: fonts.medium,
  },
  chart: {
    borderRadius: wp(4),
  },
  dotLabel: {
    color: "#ffc107",
    fontSize: wp(3),
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: fonts.regular,
  },
});

export default ClientReportChart;
