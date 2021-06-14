import React from 'react'
import Login from '../../Screens/login'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
const AuthRoute = () =>{
    return(
     
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Auth" component={Login} />
        </Stack.Navigator>
   
        )
}

export default AuthRoute;