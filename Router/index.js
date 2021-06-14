import React,{useState, useEffect} from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Auth from './Auth/index'
import Core from './Core/index'
import Ride from '../Screens/rideList'
import Profile from '../Screens/profile'
import auth from '@react-native-firebase/auth'
import CustomDrawer from '../Screens/component/drawerMenu'
const Drawer = createDrawerNavigator();

const Router = ({initialRoute}) =>{
  const [user, setUser] = useState()
  useEffect(()=>{
    auth().onAuthStateChanged((user)=>{
      setUser(user)
    })
  },[])
  const logout = () =>{

  }
    return(
        <NavigationContainer>
        <Drawer.Navigator drawerContent={props => <CustomDrawer {...props}/>} initialRouteName={initialRoute}>
          <Drawer.Screen name="Home" component={Core} />
          {user ? <Drawer.Screen name="Ride" component={Ride} /> : null}
          {!user ?<Drawer.Screen name="Login" component={Auth} />:null }
          {user ?<Drawer.Screen name="Profile" component={Profile} />:null }
          
        </Drawer.Navigator>
      </NavigationContainer>
        
        )
}

export default Router;