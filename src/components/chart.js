import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import fonts from '../assets/fonts';
import { COLORS } from '../utils/COLORS';

const chartConfig = {
  backgroundColor:COLORS.darkGray,
  backgroundGradientFrom:COLORS.darkGray,
  backgroundGradientTo:COLORS.darkGray,
  decimalPlaces: 0,
  color: () => '#ffffff',
  labelColor: () => '#ffffff',
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '0', // Default dots are hidden
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#444',
    strokeWidth: 1,
  },
};

const ClientReportChart = ({ dashboardData }) => {
  const {t}=useTranslation()

  // Default data if no dashboard data is available
  const defaultData = {
    labels: ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [6000, 7000, 8500, 6134, 5500, 4500, 4000],
        color: () => '#ffc107',
        strokeWidth: 3,
      },
    ],
  };

  // Generate chart data from dashboard monthly progress
  const generateChartData = () => {
    if (!dashboardData?.monthlyProgress?.workouts) {
      return defaultData;
    }

    const workouts = dashboardData.monthlyProgress.workouts;
    const labels = workouts.map(item => item.month);
    const data = workouts.map(item => item.count);

    return {
      labels,
      datasets: [
        {
          data,
          color: () => '#ffc107',
          strokeWidth: 3,
        },
      ],
    };
  };

  const chartData = generateChartData();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("InstructorHome.clientReport")}</Text>
      <LineChart
        data={chartData}
        width={wp(90)} // Responsive width
        height={hp(32)} // Responsive height
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots={true}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={false}
        renderDotContent={({ x, y, index }) => {
          if (index === Math.floor(chartData.datasets[0].data.length / 2)) { // Middle point
            return (
              <View key={index} style={[styles.customDotContainer, { left: x - 20, top: y - 30 }]}>
                <View style={styles.customDot} />
                <Text style={styles.dotLabel}>{chartData.datasets[0].data[index].toLocaleString()}</Text>
              </View>
            );
          }
          return null;
        }}
        yAxisLabel=""
        yAxisSuffix=""
        formatYLabel={(value) => `${parseInt(value)}`}
        yLabelsOffset={15}
        segments={4}
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
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: wp(4.5),
    fontWeight: '600',
    marginBottom: hp(2),
    alignSelf: 'flex-start',
    fontFamily:fonts.medium
  },
  chart: {
    borderRadius: wp(4),
  },
  customDotContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  customDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: COLORS.primaryColor,
    borderWidth: 2,
    borderColor: COLORS.primaryColor,
  },
  dotLabel: {
    color: COLORS.primaryColor,
    fontSize: wp(3),
    fontWeight: 'bold',
    marginTop: hp(0.5),
    fontFamily:fonts.regular
  },
});

export default ClientReportChart;