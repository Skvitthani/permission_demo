import React, {useState} from 'react';
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const DraggableFlatListScreen = () => {
  function getColor(i) {
    const multiplier = 255 / (20 - 1);
    const colorVal = i * multiplier;
    return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
  }

  const initialData = [...Array(20)].map((d, index) => {
    const backgroundColor = getColor(index);
    return {
      key: `item-${index}`,
      label: String(index) + '',
      height: 100,
      width: 60 + Math.random() * 40,
      backgroundColor,
    };
  });

  const [data, setData] = useState(initialData);

  const renderItem = ({item, drag, isActive}) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.rowItem,
            {backgroundColor: isActive ? 'red' : item.backgroundColor},
          ]}>
          <Text style={styles.text}>{item.label}</Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <DraggableFlatList
        data={data}
        onDragEnd={({data}) => setData(data)}
        keyExtractor={item => item.key}
        renderItem={renderItem}
      />
    </GestureHandlerRootView>
  );
};

export default DraggableFlatListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  rowItem: {
    height: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
