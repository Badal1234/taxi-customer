import React from 'react'
import Home from '../../Screens/home'
import Search from '../../Screens/search'
import Distance from '../../Screens/distance'
import CarSelect from '../../Screens/carSelect'
import CheckOut from '../../Screens/checkout'
import Driver from '../../Screens/driver'
import Confirm from '../../Screens/confirm'
import Info from '../../Screens/info'
import Ride from '../../Screens/rideList'
import Track from '../../Screens/tracking'
import Complete from '../../Screens/tripComplete'
import Payment from '../../Screens/payment'
import Chat from '../../Screens/chat'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
const AuthRoute = () =>{
    return(
        <Stack.Navigator initialRouteName={'home'} screenOptions={{headerShown: false}}>
          <Stack.Screen name="home" component={Home} />
          <Stack.Screen name="search" component={Search} />
          <Stack.Screen name="distance" component={Distance} />
          <Stack.Screen name="carSelect" component={CarSelect} />
          <Stack.Screen name="checkout" component={CheckOut} />
          <Stack.Screen name="driver" component={Driver} />
          <Stack.Screen name="confirm" component={Confirm} />
          <Stack.Screen name="info" component={Info} />
          <Stack.Screen name="track" component={Track} />
          <Stack.Screen name="complete" component={Complete} />
          <Stack.Screen name="payment" component={Payment} />
          <Stack.Screen name="chat" component={Chat} />
        </Stack.Navigator>
        )
}

export default AuthRoute;