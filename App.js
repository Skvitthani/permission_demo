import {
  Text,
  View,
  Alert,
  Linking,
  AppState,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import React, {useEffect, useState} from 'react';
import Geolocation from '@react-native-community/geolocation';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';

const App = () => {
  const [currentLatitude, setCurrentLatitude] = useState();
  const [currentLongitude, setCurrentLongitude] = useState();

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        try {
          if (nextAppState === 'active') {
            if (Platform.OS == 'android') {
              const checkEnabled = await isLocationEnabled();
              if (!checkEnabled) {
                const enableResult = await promptForEnableLocationIfNeeded();
                if (enableResult == 'enabled') {
                  requestLocationPermission();
                }
              }
            }
          }
        } catch (error) {
          console.log('error on change App state----------', error);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (currentLatitude && currentLongitude) {
      biometrics();
    } else {
      requestLocationPermission();
    }
  }, [currentLatitude]);

  const biometrics = () => {
    const rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
    rnBiometrics.isSensorAvailable().then(resultObject => {
      const {available, biometryType} = resultObject;
      if (available && biometryType === BiometryTypes.Biometrics) {
        rnBiometrics
          .simplePrompt({promptMessage: 'Enter Password'})
          .then(resultObject => {
            const {success} = resultObject;
            if (success) {
              Alert.alert('successful biometrics provided');
            } else {
              Alert.alert('user cancelled biometric prompt');
            }
          })
          .catch(() => {
            console.log('biometrics failed');
          });
      } else {
        console.log('Biometrics not supported');
      }
    });
  };

  const location = () => {
    Geolocation.getCurrentPosition(
      async position => {
        setCurrentLatitude(position?.coords?.latitude);
        setCurrentLongitude(position?.coords?.longitude);
        biometrics();
      },
      async error => {
        console.log('error on getting location', error);
      },
      {
        enableHighAccuracy: false,
        timeout: 25000,
        maximumAge: 10000,
      },
    );
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(async result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              break;
            case RESULTS.DENIED:
              break;
            case RESULTS.GRANTED:
              if (currentLatitude && currentLongitude) {
                biometrics();
              } else {
                location();
              }
              break;
            case RESULTS.BLOCKED:
              Linking.openSettings();
              break;
          }
        });
      } else {
        request(PERMISSIONS.IOS.LOCATION_ALWAYS).then(async result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              break;
            case RESULTS.DENIED:
              break;
            case RESULTS.GRANTED:
              if (currentLatitude && currentLongitude) {
                biometrics();
              } else {
                location();
              }
              break;
            case RESULTS.BLOCKED:
              Linking.openSettings();
              break;
          }
        });
      }
    } catch (error) {
      console.error('error --- on Getting location permission', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{color: 'black'}}>
        Your Current Latitude :: {currentLatitude}
      </Text>
      <Text style={{color: 'black'}}>
        Your Current Longitude :: {currentLongitude}
      </Text>
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={requestLocationPermission}>
        <Text style={styles.textInput}>{'Log in'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  buttonStyle: {
    padding: 20,
    marginTop: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 30,
    backgroundColor: '#706233',
  },
  textInput: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});
