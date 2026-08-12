import React from 'react';

import {
  Text as RNText,
  TextProps,
} from 'react-native';

import { useFont } from './FontContext';

const AppText = ({
  style,
  ...props
}: TextProps) => {
  const { scaleTextStyle } =
    useFont();

  return (
    <RNText
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      {...props}
      style={scaleTextStyle(style)}
    />
  );
};

export default AppText;