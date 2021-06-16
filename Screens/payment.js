import React,{useEffect,useState} from 'react'
import {View,Text, TouchableOpacity,StyleSheet} from 'react-native'
import Izyco from './component/gateaway'
import database from '@react-native-firebase/database'
import auth from '@react-native-firebase/auth'
const PaymentScreen = ({navigation, route}) => {
    const [details, setDetails] = useState({})
    const [payModal, setModal] = useState(false)
    useEffect(() =>{
        if(route.params){
            setDetails(route.params)
        }

    },[route.params])
    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Text style={{fontSize: 19, fontWeight:'bold', color:'white',letterSpacing:1}}>
                    Payment
                </Text>

            </View>
        )
    }

    const makePayment = (method) => {
        console.log(method)
        setDetails({...details, paymentMethod: method})
        if(method != 'CASH'){
           setModal(true)
        }else onSuccessHandler()

    }
      const onSuccessHandler = () => {
    
      console.log(details)
      console.log(
        'users/' +
          details.driver +
          '/my_bookings/' +
          details.id +
          '/',
      )
        database()
        .ref(
          'users/' +
            details.driver +
            '/my_bookings/' +
            details.id +
            '/',
        )
        .update({
          payment_status: 'PAID',
          payment_mode: details.paymentMode,
          customer_paid: details.customer_paid,
          discount_amount: details.discount_amount,
          usedWalletMoney: details.usedWalletAmmount,
          cardPaymentAmount: details.cardPaymentAmount,
          getway: 'izyco',
        })
        .then(() => {
        database()
            .ref(
              'users/' +
                auth().currentUser.uid +
                '/my_bookings/' +
                details.id +
                '/',
            )
            .update({
              payment_status: 'PAID',
              payment_mode: details.method,
              customer_paid: details.customer_paid,
              discount_amount: details.discount_amount,
              usedWalletMoney: details.usedWalletAmmount,
              cardPaymentAmount: details.cardPaymentAmount,
              getway: 'izyco',
            })
            .then(() => {
              database()
                .ref('bookings/' + details.id + '/')
                .update({
                  payment_status: 'PAID',
                  payment_mode: details.paymentMode,
                  customer_paid: details.customer_paid,
                  discount_amount: details.discount_amount,
                  usedWalletMoney: details.usedWalletAmmount,
                  cardPaymentAmount: details.cardPaymentAmount,
                  getway: 'izyco',
                })
                .then(() => {
                  navigation.navigate('confirm')
                })
            })
        })
    } 
  

    const renderPayment = () => {
        return(
            <View>
                <View style={{flexDirection:"row", justifyContent:'space-around', alignItems:'center',marginTop: 30}}> 
                <Text style={{fontSize: 16, fontWeight:'600'}}>
                    Total Amount
                </Text>
                <Text style={{fontSize: 16, fontWeight:'bold', color:'green'}}>
                    {details.trip_cost}
                </Text>

                </View>
                <View style={{borderWidth: 1, marginTop: 30}}/>
                <View>
                    <TouchableOpacity onPress={()=>makePayment('CASH')} style={styles.button}>
                        <Text style={{fontSize: 17, color:'white', fontWeight:'bold'}}>
                            Pay with Cash
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={()=> makePayment('CARD')}>
                        <Text style={{fontSize: 17, color:'white', fontWeight:'bold'}}>
                            Pay with Card
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>)
    }

    const renderPaymentGateAway = () => {

    }
    if(payModal){
        console.log(details)
        return(
            <View style={{flex: 1}}>
                <Izyco bookingId={details.id} onSuccess={onSuccessHandler}/>
            </View>
        )
    }
    return  ( 
        <View>
            {renderHeader()}
            {renderPayment()}

        </View>
    )
}

const styles = StyleSheet.create({
    header:{
        backgroundColor:'#243235',
            paddingVertical: 20,justifyContent:'center',alignItems:'center',flexDirection:'row'

    },
    button:{
        justifyContent:'center',
        alignItems:"center",
        backgroundColor:'#243235',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 15,
        marginTop: 15
    }
})

export default PaymentScreen;