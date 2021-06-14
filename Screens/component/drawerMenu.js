import React,{useEffect,useState} from 'react'
import {View, Text,StyleSheet, TouchableOpacity} from 'react-native'
import {
    DrawerContentScrollView,
    DrawerItemList,
  } from '@react-navigation/drawer';
  import auth from '@react-native-firebase/auth'
  
  const CustomDrawerContent = (props) => {
      //const user = auth().currentUser
      const [user, setUser] = useState()
      const logout = () => {
          auth().signOut()
          setUser(null)
      }
      useEffect(()=>{
        auth().onAuthStateChanged((user)=>{
          setUser(user)
        })
      },[])
      
    return (
      <DrawerContentScrollView {...props}>
          <View style={styles.header}>
              <Text style={{fontSize: 18, fontWeight:'bold', fontStyle:'italic'}}>
                  Asur Transfer
              </Text>
          </View>
        <DrawerItemList {...props} />
        <TouchableOpacity onPress={logout} style={{marginTop: 210,justifyContent:'center',alignItems:'center'}}>
            <Text style={{fontSize: 17, color:'blue', fontWeight:'bold'}}>
             {user ? 'Logout': null}
            </Text>
        </TouchableOpacity>
      </DrawerContentScrollView>
    );
  }

  const styles = StyleSheet.create({
      header:{
          justifyContent:'center',
          alignItems:'center',
         // backgroundColor:'#000'
      }

  })

  export default CustomDrawerContent;