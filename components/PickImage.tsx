import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';

const pickImage = (onImagePicked: (uri: string) => void) => {
  const options: ImageLibraryOptions = { mediaType: 'photo' };
  launchImageLibrary(options, (response) => {
    if (response.assets && response.assets.length > 0) {
      const selectedImage: Asset = response.assets[0];
      onImagePicked(selectedImage.uri || '');
    }
  });
};

export default pickImage;
