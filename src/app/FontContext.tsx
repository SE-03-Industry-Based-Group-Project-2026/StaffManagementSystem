import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  StyleSheet,
  TextStyle,
  StyleProp,
} from 'react-native';

export type FontSize = 'S' | 'M' | 'L';

interface FontContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  font: (baseSize: number) => number;
  scaleTextStyle: (
    style?: StyleProp<TextStyle>
  ) => TextStyle | undefined;
}

const FontContext = createContext<FontContextType>({
  fontSize: 'M',

  setFontSize: () => {},

  font: (baseSize: number) => baseSize,

  scaleTextStyle: (
    style?: StyleProp<TextStyle>
  ) => {
    if (!style) {
      return undefined;
    }

    const flattened = StyleSheet.flatten(style);

    if (!flattened) {
      return undefined;
    }

    return {
      ...flattened,
    };
  },
});

export const FontProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [fontSize, setFontSizeState] =
    useState<FontSize>('M');

  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const saved =
        await AsyncStorage.getItem('appFontSize');

      if (
        saved === 'S' ||
        saved === 'M' ||
        saved === 'L'
      ) {
        setFontSizeState(saved);
      } else {
        setFontSizeState('M');

        await AsyncStorage.setItem(
          'appFontSize',
          'M'
        );
      }
    } catch (error) {
      console.log(
        'Font size load error:',
        error
      );

      setFontSizeState('M');
    }
  };

  const setFontSize = async (
    size: FontSize
  ) => {
    try {
      setFontSizeState(size);

      await AsyncStorage.setItem(
        'appFontSize',
        size
      );
    } catch (error) {
      console.log(
        'Font size save error:',
        error
      );
    }
  };

  
  const getScale = (): number => {
    switch (fontSize) {
      case 'S':
        return 1.00;

      case 'L':
        return 1.20;

      case 'M':
      default:
        return 1.10;
    }
  };

  const font = (
    baseSize: number
  ): number => {
    return Math.round(
      baseSize * getScale()
    );
  };

  const scaleTextStyle = (
    style?: StyleProp<TextStyle>
  ): TextStyle | undefined => {
    if (!style) {
      return undefined;
    }

    const flattened =
      StyleSheet.flatten(style);

    if (!flattened) {
      return undefined;
    }

    const scaledStyle: TextStyle = {
      ...flattened,
    };

    if (
      typeof flattened.fontSize ===
      'number'
    ) {
      scaledStyle.fontSize = font(
        flattened.fontSize
      );
    }

    if (
      typeof flattened.lineHeight ===
      'number'
    ) {
      scaledStyle.lineHeight = font(
        flattened.lineHeight
      );
    }

    return scaledStyle;
  };

  return (
    <FontContext.Provider
      value={{
        fontSize,
        setFontSize,
        font,
        scaleTextStyle,
      }}
    >
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () =>
  useContext(FontContext);
