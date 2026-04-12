import {create} from 'zustand'

//create store
export const useCounterStore=create((set)=>({
    //state
    newCounter:0,
    newCounter1:100,

    //example:
    //add user state with properties name,age,email
    user:{name:"hansini",email:"hansini@gmail.com",age:20},
    //function to change email
    changeEmail:()=>set({...user,email:"hans@gmail.com"}),
    //function to change name and age


    changeNameAndAge:()=>set({...user,name:"hans",age:19}),
    incrementCounter:()=>set(state=>({newCounter:state.newCounter+1})),
    incrementCounter:()=>set(state=>({newCounter1:state.newCounter1+1})),
    decrementCounter:()=>set(state=>({newCounter:state.newCounter-1})),
    reset:()=>set({newCounter:0}),
    //function to change newCounter to 500
    changeCounter:()=>set({newCounter:500}),
    //function to decrememt newCounter1 by 20
    decrementNewCounter1:()=>set({newCounter1:state.newCounter1-20})
})
)