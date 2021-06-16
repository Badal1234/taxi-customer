import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import Polyline from '@mapbox/polyline';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import database from '@react-native-firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';
import Modal from 'react-native-modal';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
const DriverScreen = ({navigation, route}) => {
  const [ride, setRide] = useState({});
  const [distance, setDistance] = useState(0);
  const [coords, setCords] = useState([]);
  const [curCords, setCur] = useState({latitude: 0.1, longitude: 0.1});
  const [driverLoc, setDriver] = useState({});
  const [duration, setDuration] = useState(0);
  const [reason, setReason] = useState('');
  const [radio_props, setProps] = useState([]);
  const [cancel, setCancel] = useState(false);
  const [call, setCall] = useState(false);

  var map = useRef();
  useEffect(() => {
    if (route.params) {
      setRide(route.params);
      console.log(route.params);
    }
  }, [route.params]);
  console.log('ride', ride);

  useEffect(() => {
    database()
      .ref('/cancel_reason/')
      .on('value', snap => {
        if (snap.val()) setProps(snap.val());
      });
  }, []);

  useEffect(() => {
    if (ride.driver) {
      database()
        .ref(`users/${ride.driver}`)
        .on('value', snap => {
          setDriver(snap.val().location);
        });
    }
  }, [ride.driver]);

  useEffect(() => {
    getDirections(
      {
        latitude: driverLoc.lat,
        longitude: driverLoc.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      {latitude: curCords.latitude, longitude: curCords.longitude},
    );
  }, [driverLoc, curCords]);

  const getDirections = async (startLoc, dropLoc) => {
    var resp = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${dropLoc}&key=AIzaSyDwAYYq1Tn7jUJBVWMmyhv9UCOelRHMEFk`,
    );
    var respJson = await resp.json();
    console.log('res', respJson);
    setDistance(respJson.routes[0].legs[0].distance.value);
    setDuration(respJson.routes[0].legs[0].duration.value);
    var points = Polyline.decode(respJson.routes[0].overview_polyline.points);
    console.log(points);
    var coords = points.map(point => {
      return {
        latitude: point[0],
        longitude: point[1],
      };
    });
    setCords(coords);

    map.current.fitToCoordinates(
      [
        {
          latitude: curCords.latitude ? curCords.latitude : 0.0,
          longitude: curCords.longitude ? curCords.longitude : 1.0,
        },
        {
          latitude: driverLoc.lat ? driverLoc.lat : 0.0,
          longitude: driverLoc.lng ? driverLoc.lng : 1.0,
        },
      ],
      {
        edgePadding: {top: 40, right: 40, bottom: 40, left: 40},
        animated: true,
      },
    );
  };
  console.log(distance);
  console.log(ride);
  function timeDiffCalc(dateFuture, dateNo) {
    console.log(dateFuture);
    let diffInMilliSeconds = Math.abs(dateFuture - dateNo) / 1000;

    // calculate days
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;
    console.log('calculated days', days);

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;
    console.log('calculated hours', hours);

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;
    console.log('minutes', minutes);

    let difference = '';
    if (days > 0) {
      difference += days === 1 ? `${days} day, ` : `${days} days, `;
    }

    difference +=
      hours === 0 || hours === 1 ? `${hours} hour, ` : `${hours} hours, `;

    difference +=
      minutes === 0 || hours === 1
        ? `${minutes} minutes`
        : `${minutes} minutes`;

    return hours;
  }
  const cancelRide = () => {
    console.log('fffff', timeDiffCalc(new Date(), new Date(ride.tripdate)));
    if (timeDiffCalc(new Date(), new Date(ride.tripdate)) >= 1) {
      Alert.alert('You can not cancel the Ride');
    } else {
      var user = auth().currentUser;
      database()
        .ref(`users/${user.uid}/my_bookings/${ride.id}`)
        .update({
          status: 'CANCELLED',
          reason: reason,
        })
        .then(() => {
          database()
            .ref(`users/${ride.driver}/my_bookings/${ride.id}`)
            .remove();
          database()
            .ref(`bookings/${ride.id}`)
            .update({
              status: 'CANCELLED',
              reason: reason,
            })
            .then(() => {
              Alert.alert('Ride has canceled');
              navigation.goBack();
            });
        });
    }
  };
  const callToCustomer = () => {
    Linking.canOpenURL('tel:'+ride.driver_name).then(supported => {
        if (!supported) {
            console.log('Can\'t handle Phone Number: ' + ride.driver_number);
        }else {
            return Linking.openURL('tel:'+ride.driver_number);
        }
    }).catch(err => console.error('An error occurred', err));
    
}

  const renderButtons = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={cancelRide}
          style={{
            paddingHorizontal: 20,
            ...styles.card,
            backgroundColor: 'red',
            paddingVertical: 10,
            borderRadius: 10,
          }}>
          <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>
            Cancel Booking
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={()=> callToCustomer()}
          style={{
            paddingHorizontal: 20,
            ...styles.card,
            backgroundColor: 'green',
            paddingVertical: 10,
            borderRadius: 10,
          }}>
          <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white'}}>
            Call Driver
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    Geolocation.watchPosition(pos => {
      const {latitude, longitude} = pos.coords;
      setCur({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 1,
      });
    });
  }, []);

  const renderCancelModal = () => {
    return (
      <Modal>
        <View>
          <RadioForm
            radio_props={radio_props}
            initial={0}
            onPress={value => {
              setReason({value: value});
            }}
          />
        </View>
      </Modal>
    );
  };
  return (
    <View style={{flex: 1}}>
      <MapView
        ref={map}
        provider={PROVIDER_GOOGLE}
        style={{flex: 0.8}}
        provider={PROVIDER_GOOGLE}
        showUserLocation
        followUserLocation
        loadingEnabled
        region={{
          latitude: curCords.latitude,
          longitude: curCords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
        <Marker
          coordinate={{
            latitude: curCords.latitude ? curCords.latitude : 0.1,
            longitude: curCords.longitude ? curCords.longitude : 0.1,
          }}
        />
        <Marker
          style={{height: 100, width: 100}}
          imageStyle={{height: 100, width: 100}}
          image={require('../public/track_Car.png')}
          coordinate={{
            latitude: driverLoc.lat ? driverLoc.lat : 0.1,
            longitude: driverLoc.lng ? driverLoc.lng : 0.1,
          }}
        />
        <MapView.Polyline
          coordinates={coords}
          strokeWidth={5}
          strokeColor={'blue'}
        />
      </MapView>
      <View style={{position: 'absolute', width: '100%', height: '60%'}}>
        <TouchableOpacity
        onPress={()=> navigation.navigate('chat',{passData: ride})}
          style={{
            height: 50,
            width: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            top: '80%',
            left: '80%',
            backgroundColor: 'white',
          }}>
          <Icon name={'comment'} size={32} color={'green'} />
        </TouchableOpacity>
      </View>
      <View style={{flex: 0.3, ...styles.card}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View>
            <Image
              source={
                ride.car_image
                  ? {uri: ride.car_image}
                  : require('../public/swiftDesire.png')
              }
              style={{height: 40, width: 40, borderRadius: 20}}
            />
            <Text style={{fontSize: 13, fontWeight: 'bold'}}>
              {ride.vehicle_number}
            </Text>
            <Text style={{fontSize: 15, fontWeight: '600'}}>
              {ride.vehicle_model}
            </Text>
          </View>
          <View>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              OTP - {ride.otp}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Image
            source={
              ride.profile_image
                ? {uri: ride.profile_image}
                : require('../public/profilePic.png')
            }
            style={{height: 40, width: 40}}
          />
          <Text style={{fontSize: 15, fontWeight: 'bold', letterSpacing: 1}}>
            {ride.driver_name}
          </Text>
        </View>
        {renderButtons()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#243235',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 15,
    marginTop: 15,
  },
  card: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {height: 3, width: 3},
    elevation: 6,
    padding: 5,
  },
});
export default DriverScreen;
