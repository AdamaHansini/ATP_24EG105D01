//ASSIGNMENT 5: 
//-------------
//Bank Transaction Analyzer

//You are building a bank statement summary.

//Test data:
const transactions = [
  { id: 1, type: "credit", amount: 5000 },
  { id: 2, type: "debit", amount: 2000 },
  { id: 3, type: "credit", amount: 10000 },
  { id: 4, type: "debit", amount: 3000 }
];


//Tasks:
    //1. filter() all credit transactions
    let e1=transactions.filter((transObj)=>
        transObj.type==='credit')
        console.log(e1)
    //2. map() to extract only transaction amounts
    let e2=transactions.map((transObj)=>transObj.amount)
    console.log(e2)
    //3. reduce() to calculate final account balance
    let e3=transactions.reduce((acc,transObj)=>acc+transObj.amount,0)
    console.log(e3)
    //4. find() the first debit transaction
    let e4=transactions.find((transObj)=>transObj.type==='debit')
    console.log(e4)
    //5. findIndex() of transaction with amount 10000
    let e5=transactions.findIndex((transObj)=>transObj.amount===10000)
    console.log(e5)