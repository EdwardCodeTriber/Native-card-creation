// TextEditor.tsx
import React, { useState } from 'react';
import { Modal, TextInput, Button, View, StyleSheet } from 'react-native';

interface TextEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (textData: { text: string; fontSize: number }) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ visible, onClose, onSave }) => {
  const [text, setText] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(16);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <TextInput
          style={[styles.input, { fontSize }]}
          placeholder="Enter text"
          onChangeText={setText}
          value={text}
        />
        <Button title="Save" onPress={() => onSave({ text, fontSize })} />
        <Button title="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
  },
});

export default TextEditor;
