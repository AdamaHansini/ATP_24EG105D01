//Assignment 1: Daily Temperature Analyzer
//----------------------------------------
//Scenario : You are analyzing daily temperatures recorded by a weather app.

//Test data:
const temperatures = [32, 35, 28, 40, 38, 30, 42];

//Tasks:
  //  1. filter() temperatures above 35

  let r1=temperatures.filter((element)=>element>35)
  console.log("temperature above 35:",r1)

   // 2. map() to convert all temperatures from Celsius → Fahrenheit

   let r2=temperatures.map((element)=>(element*1.8+32))
   console.log("temperture is fahrenheit:",r2)

    //3. reduce() to calculate average temperature

    let r3=temperatures.reduce((accumulator,element)=>(accumulator+element) )/temperatures.length
    console.log("average of temperatures:",r3)

    //4. find() first temperature above 40

    let r4=temperatures.find((element)=>element>40)
    console.log("temperature above 40:",r4)

    //5. findIndex() of temperature 28

    let r5=temperatures.findIndex((element)=>element===28)
    console.log("index of temperature 28:",r5)