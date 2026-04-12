import React from 'react'
import { counterContextObj } from '../contexts/ContextProvider'
import { useContext } from 'react'
function Test() {
    const {counter1,changeCounter1}=useContext(counterContextObj)
    console.log("Test")
  return (
    <div><h1 className='text-4xl mt-3'>Counter1:{counter1}</h1>
    <button onClick={changeCounter1} className='bg-pink-700 p-3 mt-5 text-white'>Change</button></div>
    
  )
}

export default Test