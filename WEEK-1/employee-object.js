const employees = [
  {
    eno: 101,
    name: "Ravi",
    marks: [78, 82, 91],
  },
  {
    eno: 102,
    name: "Bhanu",
    marks: [65, 70, 68],
  },
  {
    eno: 103,
    name: "Sneha",
    marks: [88, 92, 95],
  },
  {
    eno: 104,
    name: "Kiran",
    marks: [55, 60, 58],
  },
  {
    eno: 105,
    name: "Anitha",
    marks: [90, 85, 87],
  },
];


//Insert new Emp at 2nd position
employees.splice(1,0,{eno:102,name:'hansini',marks:[10,20,30]})
console.log(employees)


//Remove an emp with name "Kiran"
/*for(let i of employees){
    if(this.name=="Kiran")
        employees.splice(i,1)
    } */
employees.splice(4,1)
console.log(employees)

//Change the last mark 95 to 75 of emp  "Sneha"
employees.splice()
employees.splice(3,1,{eno:103,name:"Sneha",marks:[88,92,75]})
console.log(employees)
