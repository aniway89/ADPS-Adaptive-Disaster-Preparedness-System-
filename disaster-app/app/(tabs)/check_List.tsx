import { useSetupStore } from '@/utils/setup';
import React from "react";
import { Text, View } from 'react-native';
import Disaster from '../../DB/stateDisasterData.json';
import data from '../../DB/supplies.json';

export default function CheckList() {
    const {location} = useSetupStore();
    const {adults} = useSetupStore();
    const {isSetuped} = useSetupStore();
    console.log("------------------------------- ")
    console.log(location, adults, isSetuped);
    console.log("Hello Checklist");
    console.log(3*adults);

    const getDisasterData = (Disaster, location)=>{
        return Object.keys(Disaster).map(Type => {
            const stats = Disaster[Type][location];
            return{
                Type,
                freq: stats?.freq || 0,
                sev: stats?.sev || 0,
            }
        })
    }
    console.log(getDisasterData(Disaster, location),location);
    const getTopDisaster = (Disaster) => {
        return [...Disaster].sort((a, b) => (b.freq * b.sev) - (a.freq * a.sev))[0];
    };
    console.log(getTopDisaster(getDisasterData(Disaster, location)));
    const top = getTopDisaster(getDisasterData(Disaster, location));
    const getSupplies = data.filter(item => {
        return(item.priority?.[top.Type] || 0) > 0.6;
    })
    console.log(getSupplies);


  return (
    <View>
      <Text>Hello Checklist</Text>

    </View>
  );
}

