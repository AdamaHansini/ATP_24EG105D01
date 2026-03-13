//ASSIGNMENT 1:
//-------------
//You are building a shopping cart summary for an e-commerce website.

//Test Data : 
const cart = [
  { id: 101, name: "Laptop", price: 60000, quantity: 1, inStock: true },
  { id: 102, name: "Mouse", price: 800, quantity: 2, inStock: true },
  { id: 103, name: "Keyboard", price: 1500, quantity: 1, inStock: false },
  { id: 104, name: "Monitor", price: 12000, quantity: 1, inStock: true }
];

//Tasks:
    //1. Use filter() to get only inStock products

    let a1=cart.filter((cartObj)=>{if(cartObj.inStock===true)
        return cartObj
    })
    console.log(a1)

    //2. Use map() to create a new array with:  { name, totalPrice }

    let a2=cart.map((cartObj)=>{ 
                    let totalPrice=cartObj.quantity*cartObj.price
      return cartObj.name+"="+totalPrice}
    )
    console.log(a2)

    //3. Use reduce() to calculate grand total cart value

    let a3=cart.reduce((acc,cartObj)=>(cartObj.quantity*cartObj.price)+acc,0)
    console.log("total:",a3)

    //4. Use find() to get details of "Mouse"

    let a4=cart.find((cartObj)=>cartObj.name==='Mouse')
    console.log(a4)

    //5. Use findIndex() to find the position of "Keyboard"

    let a5=cart.findIndex((cartObj)=>cartObj.name==='Keyboard')
    console.log(a5)
