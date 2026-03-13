//Assignment 2: Online Course Name Processor
//------------------------------------------
//Scenario : You are preparing a course list for display on a website.

//Test data:
const courses = ["javascript", "react", "node", "mongodb", "express"];


//Tasks:
   // 1. filter() courses with name length > 5

   let s1=courses.filter((element)=>element.length>5)
   console.log("courses with name length>5:",s1)

    //2. map() to convert course names to uppercase

    let s2=courses.map((element)=>element.toUpperCase())
    console.log("courses in uppercase():",s2)

    //3. reduce() to generate a single string:
      //        "JAVASCRIPT | REACT | NODE | MONGODB | EXPRESS"

    let s3=courses.reduce((accumulator,index)=>accumulator+index)
    console.log(s3)

    //4. find() the course "react"

    let s4=courses.find((element)=>element==='react')
    console.log("there is a couse:",s4)

    //5. findIndex() of "node"

    let s5=courses.findIndex((element)=>element==='node')
    console.log("index of node :",s5)
