/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import {Camera} from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import {cameraWithTensors} from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';

const TensorCamera = cameraWithTensors(Camera);

const App: () => React$Node = () => {
  const [state, setState] = useState({
    isCameraReady: false,
    isTfReady: false,
    model: null,
    predictions: null,
  });

  const cameraRef = useRef();

  const preLoad = async () => {
    const {status} = await Camera.requestPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('알림', '카메라 접근권한을 허용해주세요.');
    }

    await tf.ready();
    const model = await mobilenet.load({
      version: 2,
      alpha: 1.0,
      inputRange: [0, 1],
    });

    setState(prevState => {
      return {...prevState, isTfReady: true, model};
    });
  };

  const handleCameraReady = () => {
    setState(prevState => {
      return {...prevState, isCameraReady: true};
    });
  };

  let frameId;

  const handleCameraStream = (images, updatePreview, gl) => {
    const loop = async () => {
      try {
        console.log('🦄STRART');
        console.log(tf.memory());

        const nextImageTensor = images.next().value;

        const predictions = await state.model.classify(nextImageTensor, 1);
        // console.log({predictions});

        setState(prevState => {
          return {
            ...prevState,
            predictions,
          };
        });

        tf.dispose(nextImageTensor);

        setTimeout(() => {
          if (!frameId) {
            frameId = requestAnimationFrame(loop);
          } else {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(loop);
          }
        }, 4000);
      } catch (e) {
        console.log(e);
      }

      console.log(tf.memory());
      console.log('👽END');
    };

    loop();
  };

  useEffect(() => {
    preLoad();
  }, []);

  const textureWidth = 1125;
  const textureHeight = 2436;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.fill}>
        {state.isTfReady ? (
          <TensorCamera
            ref={cameraRef}
            style={styles.fill}
            onCameraReady={handleCameraReady}
            onReady={handleCameraStream}
            cameraTextureWidth={textureWidth}
            cameraTextureHeight={textureHeight}
            resizeWidth={textureWidth / 500}
            resizeHeight={textureHeight / 500}
            resizeDepth={3}
            autorender={true}
            autoFocus={Camera.Constants.AutoFocus.on}
            whiteBalance={Camera.Constants.WhiteBalance.auto}
          />
        ) : (
          <View style={[styles.fill, styles.center]}>
            <Text>로딩중...</Text>
          </View>
        )}

        <View
          style={{
            position: 'absolute',
            width: Dimensions.get('screen').width,
            height: Dimensions.get('screen').height,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999,
          }}>
          {state.predictions &&
            state.predictions.length > 0 &&
            state.predictions.map((item, index) => {
              console.log({item});
              return (
                <Text key={item.className} style={{fontSize: 50, color: 'red'}}>
                  {item.className}
                </Text>
              );
            })}
          {/* {state.predictions && state.predictions.length > 0 && (
            <Text
              key={state.predictions[0].className}
              style={{fontSize: 50, color: 'red'}}>
              {state.predictions[0].className}
            </Text>
          )} */}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
