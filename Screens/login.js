import React, { useState,useEffect } from 'react';
import { Button, TextInput,View,StyleSheet,TouchableOpacity,Text,Dimensions, Alert } from 'react-native';
import PhoneInput from "react-native-phone-number-input";
import auth from '@react-native-firebase/auth';
import OTPInputView from '@twotalltotems/react-native-otp-input'
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notifications } from 'react-native-notifications';
import Spinner from 'react-native-loading-spinner-overlay'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/FontAwesome'

const WIDTH = Dimensions.get('window').width
GoogleSignin.configure({
  webClientId: '643343506674-8d59ruvk1t8fhb4qfc2110hjst2s6564.apps.googleusercontent.com',
});
const LoginScreen = ({navigation}) => {
  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState(null);

  const [code, setCode] = useState('');
  const [number, setNumber] = useState('')
  const [location, setLocation] = useState('')
  const [token, setToken] = useState('')
  const [visible, setVisible] = useState(false)
  const [emailVis, setEmailVis] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigned, setIsSigned] = useState(false)

  const [user, setUser] = useState();
  function onAuthStateChanged(user) {
    setUser(user);
   
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() =>{
    Notifications.registerRemoteNotifications();

    Notifications.events().registerRemoteNotificationsRegistered((event) => {
        // TODO: Send the token to my server so it could send back push notifications...
        setToken(event.deviceToken)
        console.log("Device Token Received", event.deviceToken);
    });
    Notifications.events().registerRemoteNotificationsRegistrationFailed((event) => {
        console.error(event);
    });

  },[])

  async function onGoogleButtonPress() {
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
    console.log(idToken)
  
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    console.log(googleCredential)
  
    // Sign-in the user with the credential
    cred = await auth().signInWithCredential(facebookCredential);
    return database().ref(`users/${user.uid}`)
    .once("value").then((snap)=>{
      if(!snap.val()){
        database().ref(`users/${user.uid}`)
        .set({createdAt: new Date(), email:cred.user.email, firstName:cred.user.displayName, lastName:'', mobile: number, location: {...location},pushToken: token}).then(()=>{
          navigation.goBack()
        })
      }
  })
  }


  // Handle the button press
  async function signInWithPhoneNumber(phoneNumber) {
    console.log('dddddd')
    setVisible(true)
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    console.log(confirmation)
    //database.ref('/')
    setConfirm(confirmation);
    setVisible(false)
  }

  useEffect(async() =>{
    var jsonValue = await AsyncStorage.getItem('location')
     jsonValue != null ? JSON.parse(jsonValue) : null;
    setLocation(jsonValue)

  },[])


  const SignInWithEmail = () => {
    setVisible(true)
    //user_new = auth().currentUser

      if(!isSigned){
        auth()
        .createUserWithEmailAndPassword(email, password)
        .then(()=>{
          database().ref(`users/${user.uid}`)
        .set({createdAt: new Date(), email:email, firstName:'', lastName:'', mobile: '', location: {...location},pushToken: token}).then(()=>{
          navigation.goBack()
          setVisible(false)
        })
        })
      }else {
        auth().signInWithEmailAndPassword(email,password).then(()=>{
          setVisible(false)
          navigation.goBack()
        })
      }
     
}
 
  
  async function confirmCode(codeInput) {
    try {
      console.log(code)
      setVisible(true)
      await confirm.confirm(codeInput);
      user_new = auth().currentUser
      database().ref(`users/${user.uid}`)
      .once("value").then((snap)=>{
        if(snap.val()){
          database().ref(`users/${user.uid}`)
          .set({createdAt: new Date(), email:'', firstName:'', lastName:'', mobile: number, location: {...location},pushToken: token}).then(()=>{
            navigation.goBack()
            setVisible(false)
          })
        }else {
          setVisible(false)
          navigation.goBack()}
      })
      console.log(user)
    } catch (error) {
      console.log(error)
      setVisible(false)
      Alert.alert('Invalid code.');
    }
  }
  console.log(number)
  if (!confirm) {
    return (
      <View style={{flex:1}}>
              <Spinner 
       visible={visible} textContent={'wait'}/>
        <View style={{flex: 0.6,justifyContent:'center',alignItems:'center',backgroundColor:'black'}}>
          <Text style={{fontSize: 28, fontWeight:'bold', color:'#eee',fontStyle:'italic'}}>
            Asur Transfer
          </Text>
        </View>
        <View style={{flex: 0.3, flexDirection:'row', alignItems:'center'}}>
        {!emailVis?<PhoneInput containerStyle={{width: WIDTH -70}} onChangeFormattedText={text=> setNumber(text)}/>: 
        <View>
          <Text style={{fontSize: 18, margin: 15}}>
            {isSigned ? 'Login' : 'Signup'}
          </Text>
          <TextInput
          onChangeText={text=> setEmail(text)}
           style={{width: WIDTH - 60, height: 50, borderWidth: 0,paddingLeft: 30,borderBottomWidth: 0 }} placeholder={'Email'}/>
          <TextInput 
          onChangeText={text=> setPassword(text)}

          style={{width: WIDTH - 60, height: 50, borderWidth: 0,paddingLeft: 30,borderBottomWidth: 0  }} placeholder={'Password'}/>
          <TouchableOpacity onPress={()=> setIsSigned(!isSigned)}>
          <Text style={{fontSize: 14, margin: 20}}>
            {isSigned ? 'Not a member SignUp' : 'Already a member , SignIn'}
          </Text>

          </TouchableOpacity>

          </View>}
      <TouchableOpacity
      style={styles.button}
        onPress={() => {emailVis? SignInWithEmail(): signInWithPhoneNumber(number)}}
      >
        <Text style={{color:'white', fontSize: 17, fontWeight:'bold'}}>
          <Icon name={'arrow-right'} color={'white'} size={24}/>
        </Text>

      </TouchableOpacity>

        </View>
        <Text style={{fontSize: 17, alignSelf:'center'}}>
          Other Login Methods
        </Text>
        <View style={{flexDirection:"row", justifyContent:'space-around', alignItems:'center'}}>
          <TouchableOpacity 
          onPress={()=> onGoogleButtonPress().then((data)=> console.log(data))}
          style={{backgroundColor:'#243235', height: 40, width: 120,justifyContent:'center', alignItems:'center'}}>
            <Text style={{color:'white', fontSize: 17}}>
              Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{backgroundColor:'#243235', height: 40, width: 120,justifyContent:'center', alignItems:'center'}} onPress={()=>setEmailVis(!emailVis)}>
            <Text style={{color:'white', fontSize: 17}}>
              {!emailVis ? 'Email' : 'Number'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <Spinner
       visible={visible}/>
              <View style={{flex: 0.6,justifyContent:'center',alignItems:'center',backgroundColor:'black'}}>
          <Text style={{fontSize: 28, fontWeight:'bold', color:'#eee',fontStyle:'italic'}}>
            Asur Transfer
          </Text>
        </View>
        <View style={{flex: 0.4}}>
          {     
           <OTPInputView
    style={{width: '100%', height: 200}}
    codeInputFieldStyle={{borderColor:'blue', borderWidth: 0.5,color:'#000'}}
    pinCount={6}
    // code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
    // onCodeChanged = {code => { this.setState({code})}}
    autoFocusOnLoad
    //codeInputFieldStyle={styles.underlineStyleBase}
    codeInputHighlightStyle={{borderColor:'blue', borderWidth: 0.5}}
    onCodeFilled = {(code) => {
        console.log(code)
        setCode(code)
        confirmCode(code)
    }}
/>}


        </View>

    </View>
  );
}

const styles = StyleSheet.create({
  button:{
    height: 50,
    width: 50,
    backgroundColor:'#243235',
    borderRadius: 25,
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center',
   // marginTop: 20,

  }
})

export default LoginScreen;