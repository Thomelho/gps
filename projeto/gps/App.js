import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [points, setPoints] = useState([]);
  const [route, setRoute] = useState([]);

  const atualizarLocalizacao = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permissão para acessar a localização foi negada.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation(location);
  };

  const handleMapPress = (event) => {
    const newPoint = event.nativeEvent.coordinate;
    if (points.length < 2) {
      setPoints([...points, newPoint]);
    }
  };

  const tracarRota = async () => {
    if (points.length === 2) {
      const origin = `${points[0].latitude},${points[0].longitude}`;
      const destination = `${points[1].latitude},${points[1].longitude}`;
      const apiKey = 'SUA_CHAVE_DE_API'; // Substitua pela sua chave
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

      try {
        const response = await axios.get(url);
        const points = response.data.routes[0].overview_polyline.points;
        setRoute(decodePolyline(points));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const decodePolyline = (encoded) => {
    // Função para decodificar a polilinha (implemente ou use uma biblioteca)
    return []; // Retorne as coordenadas decodificadas
  };

  useEffect(() => {
    atualizarLocalizacao();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: location ? location.coords.latitude : -23.5505,
          longitude: location ? location.coords.longitude : -46.6333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Sua Localização"
          />
        )}
        {points.map((point, index) => (
          <Marker key={index} coordinate={point} title={`Ponto ${index + 1}`} />
        ))}
        {route.length > 0 && (
          <Polyline coordinates={route} strokeWidth={3} strokeColor="blue" />
        )}
      </MapView>
      <Button title="Atualizar Localização" onPress={atualizarLocalizacao} />
      <Button title="Traçar Rota" onPress={tracarRota} />
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '80%',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});