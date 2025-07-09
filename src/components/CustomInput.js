import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import fonts from '../assets/fonts';
import { COLORS } from '../utils/COLORS';
import CustomText from './CustomText';

const CustomInput = ({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType,
  multiline,
  maxLength,
  placeholderTextColor,
  editable,
  textAlignVertical,
  marginBottom,
  height = 58,
  autoCapitalize,
  error,
  isFocus,
  isBlur,
  width,
  onEndEditing,
  autoFocus,
  ref,
  borderRadius,
  marginTop,
  withLabel,
  isError,
  labelColor,
  borderColor,
  leftIcon, // Image source for left icon (e.g., Icons.messageIcon)
  rightIcon, // Not used for secureTextEntry (handled by eye/eye-off)
  onLeftIconPress,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePass, setHidePass] = useState(secureTextEntry);

  const handleFocus = () => {
    setIsFocused(true);
    isFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    isBlur?.();
  };

  const dynamicBorderColor = error || isError
    ? COLORS.red
    : isFocused
      ? COLORS.primaryColor
      : borderColor || COLORS.gray3;

  const dynamicBorderWidth = isFocused || error || isError ? 1 : 1;

  return (
    <View style={{ width: width || '100%' }}>
      {withLabel && (
        <CustomText
          label={withLabel}
          marginBottom={8}
          color={labelColor || COLORS.black}
        />
      )}
      <View
        style={[
          styles.mainContainer,
          {
            marginBottom: error ? 5 : marginBottom || 20,
            marginTop,
            borderColor: dynamicBorderColor,
            borderWidth: dynamicBorderWidth,
            height: height || (multiline ? 180 : 56),
            width: '100%',
            borderRadius: borderRadius || 12,
            backgroundColor: '#1D1D20',
          },
        ]}
      >
        {leftIcon && (
          <TouchableOpacity onPress={onLeftIconPress} style={{ paddingRight: 5 }}>
            <Image
              source={leftIcon}
              style={styles.icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        <TextInput
          ref={ref}
          placeholder={placeholder}
          style={[
            styles.input,
            {
              width: leftIcon && (secureTextEntry || rightIcon) ? '80%' : leftIcon || secureTextEntry || rightIcon ? '90%' : '100%',
              paddingVertical: multiline ? 18 : 0,
            },
          ]}
          secureTextEntry={secureTextEntry ? hidePass : false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          onEndEditing={onEndEditing}
          maxLength={maxLength}
          placeholderTextColor={placeholderTextColor || COLORS.gray2}
          editable={editable}
          textAlignVertical={multiline ? 'top' : textAlignVertical}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
        />
        {(secureTextEntry || rightIcon) && (
          <TouchableOpacity
            onPress={secureTextEntry ? () => setHidePass(!hidePass) : onRightIconPress}
            style={styles.iconContainer}
          >
            <Feather
              name={secureTextEntry ? (hidePass ? 'eye-off' : 'eye') : rightIcon}
              size={20}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <CustomText
          label={error}
          color={COLORS.red}
          fontSize={10}
          marginBottom={15}
        />
      )}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  input: {
    height: '100%',
    padding: 0,
    margin: 0,
    fontSize: 14,
    color: COLORS.white,
    fontFamily: fonts.regular,
  },
  iconContainer: {
    padding: 10,
    paddingRight: 10

  },
  icon: {
    width: 20, // Adjust size as needed
    height: 20, // Adjust size as needed
  },
});