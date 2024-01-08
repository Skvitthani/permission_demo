import {
  Text,
  View,
  Linking,
  AppState,
  StyleSheet,
  TouchableOpacity,
  Platform,
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
  const [currentLongitude, setCurrentLongitude] = useState();
  const [currentLatitude, setCurrentLatitude] = useState();

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        try {
          console.log('addEventListener ----------', nextAppState);
          if (nextAppState === 'active') {
            if (Platform.OS == 'android') {
              console.log('Active----------', nextAppState);
              const checkEnabled = await isLocationEnabled();
              const permission = await check(
                PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
              );
              console.log('permission----------', permission);
              if (!checkEnabled) {
                const enableResult = await promptForEnableLocationIfNeeded();
                if (enableResult == 'enabled') {
                  requestLocationPermission();
                }
              }
            }
          }
        } catch (error) {
          console.log('error----------', error);
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
        console.log('Biometrics is supported');
        rnBiometrics
          .simplePrompt({promptMessage: 'Enter Password'})
          .then(resultObject => {
            const {success} = resultObject;

            if (success) {
              console.log('successful biometrics provided');
            } else {
              console.log('user cancelled biometric prompt');
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
        console.log(error.code, error.message);
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
      <TouchableOpacity style={styles.buttonStyle} onPress={() => {}}>
        <Text style={styles.textInput}>{'Log in'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 30,
    marginTop: 20,
    backgroundColor: '#706233',
  },
  textInput: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});
