import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Platform,
  Image,
  Dimensions,
  Animated,
  Easing,
  Modal,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import * as Font from 'expo-font';
import { captureRef } from 'react-native-view-shot';
import Slider from '@react-native-community/slider';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = height * 0.6;

// Constants and configurations
const CARD_TEMPLATES = [
  { id: 1, name: 'Classic', background: '#ffffff', borderColor: '#ffd700', borderWidth: 5 },
  { id: 2, name: 'Modern', background: '#f0f0f0', borderColor: '#ff69b4', borderWidth: 3 },
  { id: 3, name: 'Minimal', background: '#000000', borderColor: '#ffffff', borderWidth: 2 },
  { id: 4, name: 'Gradient', background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', borderColor: 'transparent' },
  { id: 5, name: 'Confetti', background: '#ffffff', borderColor: '#rainbow', pattern: 'confetti' },
  { id: 6, name: 'Vintage', background: '#f4e4bc', borderColor: '#8b4513', pattern: 'vintage' }
];

const COLOR_PALETTE = [
  '#ff69b4', '#ffd700', '#ff6347', '#4169e1', '#32cd32', '#9370db',
  '#ff4500', '#00ced1', '#ff8c00', '#4b0082', '#006400', '#8b0000'
];

const FONTS = {
  'Regular': 'normal',
  'Serif': 'serif',
  'Monospace': 'monospace',
  'Dancing': require('./assets/fonts/DancingScript-Regular.ttf'),
  'Pacifico': require('./assets/fonts/Pacifico-Regular.ttf'),
  'Montserrat': require('./assets/fonts/Montserrat-Regular.ttf')
};

const BIRTHDAY_MESSAGES = [
  "Wishing you a day filled with joy and laughter! 🎉",
  "Another year older, another year wiser! 🎂",
  "May all your birthday wishes come true! 🌟",
  "Here's to another year of amazing adventures! 🎈",
  "Happy Birthday! Make it grand! 🎊",
  "Celebrating you today! 🥳",
  "May your day be as special as you are! ✨",
  "Cheers to another trip around the sun! 🥂"
];

const IMAGE_FILTERS = [
  { name: 'Normal', value: 'none' },
  { name: 'Grayscale', value: 'grayscale' },
  { name: 'Sepia', value: 'sepia' },
  { name: 'Blur', value: 'blur' },
  { name: 'Sharpen', value: 'sharpen' },
  { name: 'Contrast', value: 'contrast' }
];

const BirthdayCardApp = () => {
  // State management
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(CARD_TEMPLATES[0]);
  const [textColor, setTextColor] = useState(COLOR_PALETTE[0]);
  const [selectedFont, setSelectedFont] = useState(Object.keys(FONTS)[0]);
  const [cardText, setCardText] = useState('Happy Birthday!');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePosition, setImagePosition] = useState('top');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [imageRotation, setImageRotation] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const [imageBorderRadius, setImageBorderRadius] = useState(0);
  const [imageBorderWidth, setImageBorderWidth] = useState(0);
  const [imageBorderColor, setImageBorderColor] = useState('#000000');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const cardRef = React.useRef();

  // Load custom fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(FONTS);
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        Alert.alert('Error', 'Failed to load custom fonts');
      }
    }
    loadFonts();
  }, []);

  // Animation setup
  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  // Permission handling
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      const { status: imagePickerStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (mediaStatus !== 'granted' || imagePickerStatus !== 'granted') {
        Alert.alert('Sorry, we need permissions to make this work!');
        return false;
      }
      return true;
    }
    return false;
  };

  // Image handling functions
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const processedImage = await applyFilter(result.assets[0].uri, selectedFilter);
        setSelectedImage(processedImage);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error(error);
    }
  };

  // Image filter application
  const applyFilter = async (imageUri, filter) => {
    try {
      let operations = [];
      switch (filter) {
        case 'grayscale':
          operations.push({ grayscale: true });
          break;
        case 'sepia':
          operations.push({ sepia: true });
          break;
        case 'blur':
          operations.push({ blur: 2 });
          break;
        case 'sharpen':
          operations.push({ sharpen: 2 });
          break;
        case 'contrast':
          operations.push({ contrast: 1.5 });
          break;
      }

      if (operations.length > 0) {
        const manipResult = await manipulateAsync(
          imageUri,
          operations,
          { compress: 1, format: SaveFormat.PNG }
        );
        return manipResult.uri;
      }
      return imageUri;
    } catch (error) {
      console.error('Error applying filter:', error);
      return imageUri;
    }
  };

  // Save functionality
  const saveCard = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const localUri = await captureRef(cardRef, {
        height: CARD_HEIGHT,
        quality: 1,
      });

      if (Platform.OS === 'android') {
        const asset = await MediaLibrary.createAssetAsync(localUri);
        await MediaLibrary.createAlbumAsync('BirthdayCards', asset, false);
      } else {
        await MediaLibrary.saveToLibraryAsync(localUri);
      }

      Alert.alert('Success', 'Card saved to your gallery!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save the card');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Preview modal
  const PreviewModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPreview}
      onRequestClose={() => setShowPreview(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View ref={cardRef} style={styles.previewCard}>
            {/* Card content */}
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPreview(false)}
          >
            <Text style={styles.closeButtonText}>Close Preview</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <StatusBar barStyle="dark-content" />
    <ScrollView>
      {/* Card Preview Section */}
      <View style={styles.cardContainer}>
        <Animated.View
          ref={cardRef}
          style={[styles.card, {
            backgroundColor: selectedTemplate.background,
            borderColor: selectedTemplate.borderColor,
            borderWidth: selectedTemplate.borderWidth,
            transform: [{
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.02]
              })
            }]
          }]}
        >
          <View style={styles.cardContent}>
            {imagePosition === 'top' && selectedImage && (
              <Animated.Image
                source={{ uri: selectedImage }}
                style={[styles.cardImage, {
                  transform: [
                    { rotate: `${imageRotation}deg` },
                    { scale: imageScale }
                  ],
                  borderRadius: imageBorderRadius,
                  borderWidth: imageBorderWidth,
                  borderColor: imageBorderColor
                }]}
                resizeMode="contain"
              />
            )}
            <TextInput
              style={[styles.cardText, {
                color: textColor,
                fontFamily: FONTS[selectedFont]
              }]}
              multiline
              value={cardText}
              onChangeText={setCardText}
              placeholder="Enter your message"
              placeholderTextColor="#999"
            />
            {imagePosition === 'bottom' && selectedImage && (
              <Animated.Image
                source={{ uri: selectedImage }}
                style={[styles.cardImage, {
                  transform: [
                    { rotate: `${imageRotation}deg` },
                    { scale: imageScale }
                  ],
                  borderRadius: imageBorderRadius,
                  borderWidth: imageBorderWidth,
                  borderColor: imageBorderColor
                }]}
                resizeMode="contain"
              />
            )}
          </View>
        </Animated.View>
      </View>

      {/* Control Sections */}
      <View style={styles.controlsContainer}>
        {/* Templates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Templates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CARD_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateButton,
                  selectedTemplate.id === template.id && styles.selectedTemplate
                ]}
                onPress={() => setSelectedTemplate(template)}
              >
                <Text style={[
                  styles.templateButtonText,
                  selectedTemplate.id === template.id && styles.selectedTemplateText
                ]}>
                  {template.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pre-made Messages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Messages</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BIRTHDAY_MESSAGES.map((message, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.messageButton,
                  cardText === message && styles.selectedMessage
                ]}
                onPress={() => setCardText(message)}
              >
                <Text style={[
                  styles.messageButtonText,
                  cardText === message && styles.selectedMessageText
                ]}>
                  {message}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Font Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(FONTS).map((font) => (
              <TouchableOpacity
                key={font}
                style={[
                  styles.fontButton,
                  selectedFont === font && styles.selectedFont
                ]}
                onPress={() => setSelectedFont(font)}
              >
                <Text style={[
                  styles.fontButtonText,
                  { fontFamily: FONTS[font] },
                  selectedFont === font && styles.selectedFontText
                ]}>
                  Aa
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {COLOR_PALETTE.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  textColor === color && styles.selectedColor
                ]}
                onPress={() => setTextColor(color)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Image Controls */}
        {selectedImage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Image Adjustments</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Rotation</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={360}
                value={imageRotation}
                onValueChange={setImageRotation}
              />
              <Text style={styles.sliderLabel}>Size</Text>
              <Slider
                style={styles.slider}
                minimumValue={0.5}
                maximumValue={2}
                value={imageScale}
                onValueChange={setImageScale}
              />
              <Text style={styles.sliderLabel}>Border Radius</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={50}
                value={imageBorderRadius}
                onValueChange={setImageBorderRadius}
              />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={pickImage}
          >
            <Text style={styles.actionButtonText}>
              {selectedImage ? 'Change Image' : 'Add Image'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowPreview(true)}
          >
            <Text style={styles.actionButtonText}>Preview</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={saveCard}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Save Card</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

    {/* Preview Modal */}
    <PreviewModal />
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  cardContainer: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    padding: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardImage: {
    width: CARD_WIDTH * 0.8,
    height: CARD_WIDTH * 0.6,
    marginVertical: 10,
    borderRadius: 5,
  },
  cardText: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 10,
  },
  controls: {
    padding: 20,
  },
  imageControls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    minWidth: 100,
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  templateButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedTemplate: {
    backgroundColor: "#007AFF",
  },
  templateButtonText: {
    color: "#333",
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#000",
  },
  fontButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedFont: {
    backgroundColor: "#007AFF",
  },
  fontButtonText: {
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageControlsContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    margin: 10,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedFilter: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#333',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabel: {
    fontSize: 14,
    marginTop: 10,
  },
  messagesContainer: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    margin: 10,
  },
  messageButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    maxWidth: 200,
  },
  selectedMessage: {
    backgroundColor: '#007AFF',
  },
  messageButtonText: {
    color: '#333',
    fontSize: 12,
  },
});

export default BirthdayCardApp;