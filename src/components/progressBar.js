// components/ProgressBar.js
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { COLORS } from '../utils/COLORS';

const ProgressBar = () => {
  const { currentSection, sections } = useSelector(state => state.progress);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        {sections.map((section, index) => (
          <View
            key={section.id}
            style={[
              styles.progressSegment,
              {
                backgroundColor: 
                  index < currentSection 
                    ? COLORS.primaryColor 
                    : index === currentSection 
                    ? COLORS.primaryColor 
                    : '#4a4a4a', 
                opacity: 
                  index < currentSection 
                    ? 1 // Completed sections
                    : index === currentSection 
                    ? 0.8 // Current section
                    : 0.3, // Upcoming sections
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});

export default ProgressBar;