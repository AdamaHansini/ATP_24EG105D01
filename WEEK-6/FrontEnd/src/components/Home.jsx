import {useContext} from 'react'
import { counterContextObj } from '../contexts/ContextProvider'
import { useCounterStore } from '../store/CounterStore'
import Test from './Test'
function Home() {

  const {counter,changeCounter}=useContext(counterContextObj)
  
//call useCounter hook to get state of Zustand store
  let newcounter=useCounterStore(state=>state.newcounter);
  let incrementCounter=useCounterStore(state=>state.incrementCounter)
  console.log("Home")
  return (
    <div className='text-center'>
      <h1 className='text-4xl'>Counter:{counter}</h1>
    <button onClick={changeCounter} className='bg-pink-700 p-3 mt-5 text-white'>Change</button>
    
    <h1 className='text-4xl mt-3'>New Counter:{newcounter}</h1>
    <button onClick={incrementCounter} className='bg-black p-3 mt-5 text-white'>Change</button>
    <Test/>
</div>
)
}

export default Home