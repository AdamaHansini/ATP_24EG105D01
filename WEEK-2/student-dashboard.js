//ASSIGNMENT 2:
//-------------
//Student Performance Dashboard

//You are working on a college result analysis system.

//Test Data:
const students = [
  { id: 1, name: "Ravi", marks: 78 },
  { id: 2, name: "Anjali", marks: 92 },
  { id: 3, name: "Kiran", marks: 35 },
  { id: 4, name: "Sneha", marks: 88 },
  { id: 5, name: "Arjun", marks: 40 }
];

//Tasks:
    //1. filter() students who passed (marks ≥ 40)

    let b1=students.filter((stdObj)=>stdObj.marks>=40)
    console.log(b1)


    //2. map() to add a grade field
            /*  ≥90 → A
              ≥75 → B
              ≥60 → C
             else → D */

    let b2=students.map((stdObj)=>{
        if(stdObj.marks>=90)
            return stdObj.name+"="+'A'
        if(stdObj.marks>=75)
            return stdObj.name+"="+'B'
        if(stdObj>=60)
            return stdObj.name+"="+'C'
        else
            return stdObj.name+"="+'D'
    })
    console.log(b2)

   //3. reduce() to calculate average marks

   let b3=students.reduce((acc,stdObj)=>acc+stdObj.marks,0)/students.length
   console.log(b3)

   //4. find() the student who scored 92

    let b4=students.find((stdObj)=>stdObj.marks===92)
    console.log(b4)

   //5. findIndex() of student "Kiran"
   let b5=students.findIndex((stdObj)=>stdObj.name==='Kiran')
   console.log(b5)