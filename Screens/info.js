import React,{useState,useEffect} from 'react'
import {View,StyleSheet,TouchableOpacity,Text,TextInput,Dimensions, Alert,StatusBar} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
const InfoScreen = ({navigation, route}) => {
    const [count, setCount] = useState(0)
    const [fields, setFields] = useState([{ name:'', number:'',email:'', passport:'' }]);
    const [details, setDetails] = useState({})
    function handleAdd() {
        const values = [...fields];
        values.push({ name:'', number:'',email:'', passport:'' });
        setFields(values);
      }
    
      function handleRemove(i) {
        const values = [...fields];
        values.splice(i, 1);
        setFields(values);
      }

      const handleUpdate = (field, name, index) => {
        const values = [...fields];
        values[index][field] = name
        setFields(values)

      }
      useEffect(()=> {
          if(route.params){
              setDetails(route.params)
          }

      },[route.params])
      const submit = () => {
          if(fields.length >=1 && fields[0].name != '' && fields[0].email != '' && fields[0].number != '' && fields[0].passport != '' ){
            navigation.navigate('checkout',{...details, passengers: fields})
              
          }else{
            Alert.alert('Please Enter Passenger Details')

          }
          
          
      }

      const renderButton = () => {
          return(
              <TouchableOpacity style={styles.button} onPress={submit}>
                  <Text style={{fontSize: 18, color:'white', fontWeight:'bold'}}>
                      PROCEED
                  </Text>
              </TouchableOpacity>
            )
      }
    const renderInputFields = () => {
        return(
            <View>
                {fields.map((val, index)=>{
                    return(
                        <View style={{...styles.card}}>
                            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                           <Text style={{fontSize: 17, fontWeight:'bold',marginLeft: 10}}>
                            {index+1}.   Passenger Details
                           </Text>
                        <Icon onPress={()=> handleRemove(index)} name={'trash'} size={26} color={'red'} style={{marginRight: 10}}/>
                            </View>
                            <Text style={{fontSize: 13, fontWeight:'600', marginLeft: 10}}>
                           NAME & SURNAME
                        </Text>

                        <TextInput value={val.name} onChangeText={text=>handleUpdate('name',text,index )} style={styles.input}/>
                        
                        <Text style={{fontSize: 13, fontWeight:'600', marginLeft: 10}}>
                           MOBILE NUMBER
                        </Text>
                        <TextInput value={val.number} onChangeText={text=>handleUpdate('number',text,index )} style={styles.input}/>
                        <Text style={{fontSize: 13, fontWeight:'600', marginLeft: 10}}>
                           EMAIL - ID
                        </Text>
                        <TextInput value={val.email} onChangeText={text=>handleUpdate('email',text,index )} style={styles.input}/>
                        <Text style={{fontSize: 13, fontWeight:'600', marginLeft: 10}}>
                          ID/PASSPORT NUMBER
                        </Text>
                        <TextInput value={val.passport} onChangeText={text=>handleUpdate('passport',text,index )} style={styles.input}/>
                        </View>
                    )
                   

                })}
            </View>
            )
    }
    return(
        <View style={{flex:1,marginTop: StatusBar.currentHeight}}>
            <View style={styles.card}>
                <Text style={{fontSize: 17, fontWeight:'bold',fontStyle:'italic',alignSelf:'center'}}>
                    Number of Passengers
                </Text>
                <View style={{flexDirection:'row',justifyContent:'space-around', paddingTop: 20}}>
                    <Text style={{fontSize:16, fontWeight:'500'}}>
                        Add Passenger
                    </Text>
                    <Text>
                        {fields.length}
                    </Text>
                    <TouchableOpacity onPress={handleAdd}>
                        <Icon name={'plus-circle'} size={25} />
                    </TouchableOpacity>
                </View>
            </View>
            {renderInputFields()}
            {renderButton()}

        </View>
        )
}

const styles = StyleSheet.create({
    card:{
        paddingVertical: 10,
        backgroundColor:'#fff',
        margin: 2,
        shadowColor:'#000',
        shadowOffset:{height: 3, width: 3},
        elevation: 3,
        borderRadius: 10
    },
    input:{
        borderWidth:0,
        borderBottomWidth: 1,
        width: Dimensions.get('window').width - 30,
        height: 40,
        marginLeft: 10,
        color:'black',
        fontWeight:'700'
    },
    button:{
        justifyContent:'center',
        alignItems:"center",
        backgroundColor:'#243235',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 15,
        marginTop: 15
    }

})
export default InfoScreen;