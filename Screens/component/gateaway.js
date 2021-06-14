import React,{useEffect, useState} from 'react'
import {View,Text} from 'react-native'
import auth from '@react-native-firebase/auth'
import { WebView } from 'react-native-webview';
import { Alert } from 'react-native';
const IzycoView  = (props) =>{
    console.log(props)
    const {bookingId, onSuccess} = props
    const [url, set_url] = useState()
    const [token, set_token] = useState('')
    const url_create = 'https://us-central1-taxiapp-c85c5.cloudfunctions.net/createIzyico'
    const url_verify = 'https://us-central1-taxiapp-c85c5.cloudfunctions.net/verifyIzyco'
    useEffect(()=>{
        const user = auth().currentUser
        console.log('dhdhdfbdhfbda',bookingId)
        if(bookingId){
            fetch(url_create,{
                method:'POST',
                body:JSON.stringify({
                    bookingId: bookingId,
                    userId: user.uid
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                  },
            })
            .then((response) => response.json())
            .then((responseJson)=>{
                console.log('dnvbvkrgw')
                console.log('redd',responseJson)
                set_url(responseJson.paymentPageUrl)
                set_token(responseJson.token)
            }).catch(err=>{
                console.log('dfafa')
                console.log('err',err)
            })

        }
      
    },[bookingId])

    const onLoadStart = (syntheticEvent) =>{
        const { nativeEvent } = syntheticEvent;
        console.log(nativeEvent.url)
        let matchUrl = nativeEvent.url.split('?')[0];
        if(matchUrl === 'http://localhost:3000/verifyPayment'){
            fetch(url_verify,{
                body:JSON.stringify({token: token}),
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                  },
            })
            .then((response) => response.json())
            .then(responseJson=>{
                console.log(responseJson)
                if(responseJson){
                    Alert.alert('Payment Successful')
                    onSuccess()
                }
            })
        }
    }

    if(url){
        return (
          
            <WebView 
            style={{flex:1}}
             originWhitelist={['*']}
             source={{uri: url}} 
             onLoadStart={onLoadStart}/>
       

        )
    }
    return(
        <View style={{justifyContent:'center', alignItems:'center',flex: 1}}>
            <Text>
                ...Loading
            </Text>

        </View>
    )
}

export default IzycoView;