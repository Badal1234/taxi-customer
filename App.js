import React,{useEffect,useState} from 'react'
import Router from './Router/index'
import 'react-native-gesture-handler';
import { Notifications } from 'react-native-notifications';
import AnimatedSplash from "react-native-animated-splash-screen";
const App = () =>{
  const [initialRoute, setInitialRoute] = useState("Home")
  const [load, setLoad] = useState(false)

  useEffect(()=>{
    setTimeout(()=>{
      setLoad(true)
    }, 2000)
  },[])

  useEffect(()=>{
    Notifications.events().registerNotificationReceivedBackground((notification, completion) => {
      console.log("Notification Received - Background", notification.payload);

      // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
      completion({alert: true, sound: true, badge: false});
        });
        Notifications.events().registerNotificationReceivedForeground((notification,completion) => {
          console.log(JSON.stringify(notification.payload));
        
          // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
          completion({alert: true, sound: true, badge: false});
        });
        Notifications.events().registerNotificationOpened((notification, completion, action) => {
          console.log("Notification opened by device user", notification.payload);
          payload = JSON.parse(notification.payload.body)
          console.log(`Notification opened with an action identifier: ${action} and response text: ${action}`);
          setInitialRoute(payload.route)
          completion();
            });

  },[])
  return(
    <AnimatedSplash
    translucent={true}
    isLoaded={load}
    logoImage={require("./public/logo.jpg")}
    backgroundColor={"#262626"}
    logoHeight={150}
    logoWidth={150}
  >
    <Router/>
  
    </AnimatedSplash>
  )
}

export default App