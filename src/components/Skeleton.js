"use client"

import React from "react"
import { Animated, Easing, StyleSheet, View } from "react-native"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"

/**
 * Skeleton Loading Component
 * @param {number|string} [width='100%'] - Width of the skeleton (e.g., 200, '100%')
 * @param {number|string} [height=hp(2)] - Height of the skeleton
 * @param {number} [borderRadius=wp(1)] - Border radius of the skeleton
 * @param {'box'|'text'|'circle'} [variant='box'] - Type of skeleton
 * @param {number} [speed=1000] - Animation speed in milliseconds
 * @param {boolean} [animated=true] - Whether to show the shimmer animation
 * @param {string} [color='#e1e1e1'] - Background color of the skeleton
 * @param {string} [highlightColor='#f5f5f5'] - Highlight color of the shimmer effect
 * @param {Object} [style] - Additional styles to apply
 * @param {number} [lines=1] - Number of lines for text variant
 * @param {number} [lineSpacing=8] - Spacing between lines for text variant
 */
const Skeleton = ({
  width = '100%',
  height = hp(2),
  borderRadius = wp(1),
  variant = 'box',
  speed = 1000,
  animated = true,
  color = '#e1e1e1',
  highlightColor = '#f5f5f5',
  style,
  lines = 1,
  lineSpacing = 8,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current

  // Calculate dimensions based on variant
  const getDimensions = () => {
    if (variant === 'circle') {
      const size = typeof width === 'number' ? width : typeof height === 'number' ? height : 40
      return {
        width: size,
        height: size,
        borderRadius: size / 2,
      }
    }
    return { width, height, borderRadius }
  }

  // Start animation
  React.useEffect(() => {
    if (!animated) return
    
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: speed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [])

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  // Render single skeleton item
  const renderSkeleton = () => (
    <View 
      style={[
        styles.skeleton,
        getDimensions(),
        { backgroundColor: color },
        style
      ]}
    >
      {animated && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              opacity: animatedValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.2, 0.5, 0.2],
              }),
              backgroundColor: highlightColor,
            },
          ]}
        />
      )}
    </View>
  )

  // Render multiple lines for text variant
  if (variant === 'text' && lines > 1) {
    return (
      <View style={styles.textContainer}>
        {[...Array(lines)].map((_, index) => (
          <View 
            key={index}
            style={[
              styles.textLine, 
              { 
                marginBottom: index < lines - 1 ? lineSpacing : 0,
                width: index === lines - 1 ? '80%' : '100%' // Make last line shorter
              }
            ]}
          >
            {renderSkeleton()}
          </View>
        ))}
      </View>
    )
  }

  return renderSkeleton()
}

// Exercise Grid Skeleton Component
/**
 * Grid Skeleton for Exercise Items
 * @param {number} [count=6] - Number of skeleton items to render
 * @param {number} [itemWidth=wp(40)] - Width of each grid item
 * @param {number} [itemHeight=hp(15)] - Height of each grid item
 */
export const ExerciseGridSkeleton = ({ count = 6, itemWidth = wp(40), itemHeight = hp(15) }) => {
  return (
    <View style={styles.gridContainer}>
      {[...Array(count)].map((_, index) => (
        <Skeleton 
          key={index} 
          width={itemWidth} 
          height={itemHeight} 
          borderRadius={wp(3)} 
          variant="box"
        />
      ))}
    </View>
  )
}

// Category Skeleton Component
/**
 * Category Skeleton Component
 * @param {number} [count=4] - Number of category skeletons to render
 * @param {number} [itemWidth=wp(25)] - Width of each category item
 * @param {number} [itemHeight=wp(20)] - Height of each category item
 */
export const CategorySkeleton = ({ count = 4, itemWidth = wp(25), itemHeight = wp(20) }) => {
  return (
    <View style={styles.categoryContainer}>
      {[...Array(count)].map((_, index) => (
        <Skeleton
          key={index}
          width={itemWidth}
          height={itemHeight}
          variant="circle"
          style={styles.categoryItem}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e1e1e1',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textContainer: {
    width: '100%',
  },
  textLine: {
    height: 16,
    marginBottom: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: wp(2),
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: wp(2),
  },
  categoryItem: {
    margin: wp(1),
  },
})

export default Skeleton
