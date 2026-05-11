import {create} from 'zustand'

//create store
export const useCounterStore=create((set)=>({
    //state
    newcounter:0,
    newcounter1:100,

    //example:
    //add user state with properties name,age,email
    user:{name:"hansini",email:"hansini@gmail.com",age:20},
    //function to change email
    changeEmail:()=>set(state=>({user:{...state.user,email:"hans@gmail.com"}})),
    //function to change name and age
    changeNameAndAge:()=>set(state=>({user:{...state.user,name:"hans",age:19}})),

    incrementCounter:()=>set(state=>({newcounter:state.newcounter+1})),
    incrementCounter1:()=>set(state=>({newcounter1:state.newcounter1+1})),
    decrementCounter:()=>set(state=>({newcounter:state.newcounter-1})),
    reset:()=>set({newcounter:0}),
    //function to change newcounter to 500
    changeCounter:()=>set({newcounter:500}),
    //function to decrememt newcounter1 by 20
    decrementNewCounter1:()=>set(state=>({newcounter1:state.newcounter1-20}))
})
)