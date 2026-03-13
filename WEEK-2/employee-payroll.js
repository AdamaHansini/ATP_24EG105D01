//ASSIGNMENT 3:
//-------------
//Employee Payroll Processor

//You are building a salary processing module in a company HR app.

//Test data:
const employees = [
  { id: 201, name: "Amit", salary: 45000, department: "IT" },
  { id: 202, name: "Neha", salary: 60000, department: "HR" },
  { id: 203, name: "Rahul", salary: 75000, department: "IT" },
  { id: 204, name: "Pooja", salary: 30000, department: "Sales" }
];

//Tasks:
    //1. filter() employees from IT department

    let c1=employees.filter((empObj)=>{
        if(empObj.department==='IT')
            return empObj})

    console.log(c1)
    //2. map() to add:
          //  netSalary = salary + 10% bonus

          let c2=employees.map((empObj)=>empObj.salary+(0.1*empObj.salary))
          console.log(c2)

    //3. reduce() to calculate total salary payout

    let c3=employees.reduce((acc,empObj)=>acc+empObj.salary,0)
    console.log(c3)

    //4. find() employee with salary 30000

    let c4=employees.find((empObj)=>empObj.salary===30000)
    console.log(c4)

    //5. findIndex() of employee "Neha"

    let c5=employees.findIndex((empObj)=>empObj.name==='Neha')
    console.log(c5)
