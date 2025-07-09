import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import fonts from '../assets/fonts';
import { COLORS } from '../utils/COLORS';

const categories = [
  { id: 1, name: 'All', active: true }, 
  { id: 2, name: 'Swing', active: false },
  { id: 3, name: 'Goblet Squat', active: false },
  { id: 4, name: 'Snatch', active: false },
  { id: 5, name: 'Turkish', active: false },
];

export default function Categories() { 
    const {t}=useTranslation()
  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        item.active && styles.activeCategoryButton
      ]}
    >
      <Text style={[
        styles.categoryText,
        item.active && styles.activeCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryList}
    />
  );
}

const styles = StyleSheet.create({
  categoryList: {
    paddingRight: wp(4),
  },
  categoryButton: {
    paddingHorizontal: wp(5),
    paddingVertical: wp(0.7),
    borderRadius: wp(6),
    backgroundColor: COLORS.backgroundColor,
    marginRight: wp(3),
    borderWidth: 0.5,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: wp(8), 
  },
  activeCategoryButton: {
    backgroundColor: COLORS.primaryColor,
    borderColor: COLORS.gray3,
  },
  categoryText: {
    color: COLORS.gray3,
    fontSize: 12,
    fontFamily: fonts.medium,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: wp(4),
  },
  activeCategoryText: {
    color: '#000',
    fontFamily: fonts.medium,
  },
});