import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const TestVideoScreen = () => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await videoRef.current.playAsync();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error toggling play/pause:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste de Vídeo</Text>
      
      <Video
        ref={videoRef}
        style={styles.video}
        source={require('../../assets/Holding.mp4')}
        posterSource={require('../../assets/Holding.mp4')}
        usePoster={true}
        useNativeControls={false}
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        shouldPlay={false}
        onLoad={() => console.log('Video loaded successfully')}
        onError={(error) => console.error('Video error:', error)}
        onPlaybackStatusUpdate={(status) => console.log('Video status:', status)}
      />
      
      <TouchableOpacity style={styles.button} onPress={togglePlayPause}>
        <Text style={styles.buttonText}>
          {isPlaying ? 'Pausar' : 'Reproduzir'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  video: {
    width: 300,
    height: 200,
    backgroundColor: '#333',
  },
  button: {
    backgroundColor: '#1777CF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestVideoScreen;