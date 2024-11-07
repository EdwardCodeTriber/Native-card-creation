import React, { useState } from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import CardCanvas from '../../components/CardCanvas';
import TextEditor from '../../components/TextEditor';
import pickImage from '../../components/PickImage';
import DecorationSelector from '../../components/DecorationSelector';

interface TextData {
  text: string;
  fontSize: number;
}

const BirthdayCardApp: React.FC = () => {
  const [isTextEditorVisible, setTextEditorVisible] = useState<boolean>(false);
  const [texts, setTexts] = useState<TextData[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [decorations, setDecorations] = useState<number[]>([]);

  const handleTextSave = (newText: TextData) => {
    setTexts([...texts, newText]);
    setTextEditorVisible(false);
  };

  const handleImagePick = (uri: string) => {
    setImages([...images, uri]);
  };

  const handleDecorationSelect = (decoration: number) => {
    setDecorations([...decorations, decoration]);
  };

  return (
    <View style={styles.container}>
      <CardCanvas>
        {texts.map((text, index) => (
          <Text key={index} style={{ fontSize: text.fontSize }}>
            {text.text}
          </Text>
        ))}
        {images.map((imageUri, index) => (
          <Image key={index} source={{ uri: imageUri }} style={styles.image} />
        ))}
        {decorations.map((decoration, index) => (
          <Image key={index} source={decoration} style={styles.decoration} />
        ))}
      </CardCanvas>

      <Button title="Add Text" onPress={() => setTextEditorVisible(true)} />
      <Button title="Pick Image" onPress={() => pickImage(handleImagePick)} />
      <DecorationSelector onSelect={handleDecorationSelect} />

      <TextEditor
        visible={isTextEditorVisible}
        onClose={() => setTextEditorVisible(false)}
        onSave={handleTextSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
  decoration: {
    width: 50,
    height: 50,
  },
});

export default BirthdayCardApp;
