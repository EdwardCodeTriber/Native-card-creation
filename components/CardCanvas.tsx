import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';

interface CardCanvasProps {
  children: React.ReactNode;
}

const CardCanvas: React.FC<CardCanvasProps> = ({ children }) => {
  return (
    <ImageBackground source={require('./path/to/birthday-background.png')} style={styles.canvas}>
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CardCanvas;
