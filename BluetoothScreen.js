import {
  Text,
  View,
  FlatList,
  StyleSheet,
  NativeModules,
  TouchableOpacity,
  NativeEventEmitter,
} from 'react-native';
import {requestPermissions} from './Permission';
import React, {useEffect, useState} from 'react';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BluetoothScreen = () => {
  const [allDevices, setAllDevices] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      requestPermissions();
      BleManager.checkState().then(state => {
        if (state == 'off') {
          BleManager.enableBluetooth();
        }
      });

      BleManager.start({showAlert: false});

      bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverDevice,
      );
    };
    fetch();
  }, []);

  const handleStopScan = () => {
    console.log('GM: Stopped scanning');
  };

  const isDuplicteDevice = (devices, nextDevice) => {
    return devices.findIndex(device => nextDevice.id === device.id) > -1;
  };

  const handleDiscoverDevice = device => {
    if (device.name !== null) {
      setAllDevices(prevState => {
        if (!isDuplicteDevice(prevState, device)) {
          return [...prevState, device];
        }
        return prevState;
      });
    }
  };

  const onScanPress = async () => {
    await BleManager.scan([], 60, false);
  };

  const connectToDevice = item => {
    console.log('item', item);
    BleManager.retrieveServices(item?.id).then(peripheralInfo => {
      console.log('peripheralInfo', peripheralInfo);
      BleManager.read(item?.id, '1800', '2a00')
        .then(readData => {
          console.log(readData);
        })
        .catch(error => {
          console.log(error);
        });
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.buttonStyle}
        onPress={onScanPress}>
        <Text style={styles.buttonTextStyle}>Scan Bluetooth Devices</Text>
      </TouchableOpacity>
      <FlatList
        data={allDevices}
        style={{marginTop: 10}}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              style={styles.renderItemButton}
              onPress={() => {
                connectToDevice(item);
              }}>
              <Text style={{color: '#fff'}}>{item?.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default BluetoothScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonStyle: {
    padding: 20,
    marginTop: 10,
    borderRadius: 20,
    alignSelf: 'center',
    backgroundColor: '#307ecc',
  },
  buttonTextStyle: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  renderItemButton: {
    height: 50,
    marginBottom: 5,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: 'gray',
    justifyContent: 'center',
  },
});
