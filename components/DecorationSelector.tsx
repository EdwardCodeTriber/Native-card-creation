import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface DecorationSelectorProps {
  onSelect: (decoration: number) => void;
}

const decorations = [
  require('./path/to/decoration1.png'),
  require('./path/to/decoration2.png'),
];

const DecorationSelector: React.FC<DecorationSelectorProps> = ({ onSelect }) => (
  <View style={styles.container}>
    {decorations.map((decoration, index) => (
      <TouchableOpacity key={index} onPress={() => onSelect(decoration)}>
        <Image source={decoration} style={styles.decoration} />
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  decoration: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
  },
});

export default DecorationSelector;
