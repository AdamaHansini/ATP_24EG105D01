import React, { useState } from 'react'
import { createContext } from 'react'

//create contect provider object

export const counterContextObj=createContext()

function ContextProvider({children}) {
    //state
    const[counter,setCounter]=useState(0);
    const[counter1,setCounter1]=useState(0)
    //functions to change state
    const changeCounter=()=>{
        setCounter(counter+1)
    }
    const changeCounter1=()=>{
        setCounter1(counter1+1)
    }

  return (
    <counterContextObj.Provider value={{counter,changeCounter,counter1,changeCounter1}}>
        {children}
    </counterContextObj.Provider>
)
}

export default ContextProvider
