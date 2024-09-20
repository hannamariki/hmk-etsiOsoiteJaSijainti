import { useState, useEffect } from 'react'; 
import { StyleSheet, View, Alert, TextInput, Button } from 'react-native'; 
import MapView, { Marker } from 'react-native-maps'; 
import * as Location from 'expo-location';


export default function App() {

  const [address, setAddress] = useState({
    address: "",
    latitude: null,
    longitude: null,
  });

  const [keyword, setKeyword] = useState("");
  const [positioning, setPositioning] = useState(null);

  // geokoodin haku
  const getLocation = async () => {
    try {
      let response = await fetch(`https://geocode.maps.co/search?q=${keyword}`); 
      let data = await response.json(); 

      if (data.length > 0) { 
        const { lat, lon } = data[0];
        setAddress({ 
          ...address, 
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        });
      } else {
        Alert.alert('No results found'); 
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch coordinates'); 
    }
  };

  // sijainnin haku
  const gePositioning = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();//kysyy lupaa
    if (status !== 'granted') {
      Alert.alert('No permission to get location');
      return;
    }
    const positioning = await Location.getCurrentPositionAsync({});//hakee nykyisen sijainnin
    setPositioning(positioning.coords);
    //console.log(positioning);
    
    // päivittää nykyisen sijainnin koordinaatit
    setAddress({ 
      ...address, 
      latitude: positioning.coords.latitude, 
      longitude: positioning.coords.longitude 
    });
  }

  useEffect(() => {gePositioning();}, []);

  
  const handleFetch = () => {
    setAddress({ ...address, address: keyword });
    getLocation(); 
  };

  return (
    <View style={styles.container}>
      {address.longitude && address.latitude && (
        <MapView
          style={{ width: "100%", height: "80%" }}
          region={{
            latitude: address.latitude,
            longitude: address.longitude,
            latitudeDelta: 0.0322,
            longitudeDelta: 0.0221
          }}
        >
          <Marker
            coordinate={{
              latitude: address.latitude, 
              longitude: address.longitude
            }}
          />
        </MapView>
      )}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.textInput} 
          placeholder='keyword' 
          value={keyword} 
          onChangeText={text => setKeyword(text)} 
        />
        <Button title="SHOW" onPress={handleFetch} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 10,
  },
  textInput: {
    fontSize: 18,
    width: '100%',
    marginBottom: 10,
  },
});
