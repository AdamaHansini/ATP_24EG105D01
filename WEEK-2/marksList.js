//Assignment 3: Student Marks List
//--------------------------------
//Scenario : You receive marks from an exam system.

//Test data:
const marks = [78, 92, 35, 88, 40, 67];

//Tasks:
  //  1. filter() marks ≥ 40 (pass marks)

    let t1=marks.filter((element)=>element>=40)
    console.log("marks>=40:",t1)

  //  2. map() to add 5 grace marks to each student

  let t2=marks.map((element)=>element+5)
  console.log("adding 5 grace marks:",t2)

  //  3. reduce() to find highest mark

  let t3=marks.reduce((accumulator,index)=>{
    if(accumulator<index)
        accumulator=index
    return accumulator
    })
    console.log("highest mark:",t3)

  //  4. find() first mark below 40

  let t4=marks.find((element)=>element<40)
  console.log("the marks below 40:",t4)

  //  5. findIndex() of mark 92

  let t5=marks.findIndex((element)=>element===92)
  console.log("index of mark=92:",t5)