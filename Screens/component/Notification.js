export function RequestPushMsg(token,msg,customerUID){
    console.log('param=>',token,msg)
    console.log('fjkfjfjff')
    var user = firebase.auth().currentUser
    fetch('https://us-central1-taxiapp-c85c5.cloudfunctions.net/sendPushNotification', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data:{
      "to": token,                        
      "title": languageJSON.notification_title,                  
      "body": msg,  
      "data": {"msg":msg,"title":languageJSON.notification_title},          
      "priority": "high",            
      "sound":"default",   
      "channelId": "messages" 
    },
    FCMToken: token

    
  })
}).then((data)=>{
  console.log(data)
  return true})
    .catch(err=> {
      console.log(err)
      return false})
    
}