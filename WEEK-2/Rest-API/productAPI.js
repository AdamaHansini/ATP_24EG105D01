
import exp from 'express'
export const productApp=exp.Router()


let products=[]

//read all products
productApp.get('/products',(req,res)=>{
    res.json({message:"all products",payload:products})
})

//read all products by brand
productApp.get("/products/:id",(req,res)=>{
    //get product if from url param
    let idOfUrl=Number(req.params.brand)
    //find product
    let product=products.find(productObj=>productObj.brand===idOfUrl)
    //if product not found
    if(product===undefined)
        return res.json({message:"product not found"})

    //send res
    res.json({message:"a product",payload:product})
})

//create new product
productApp.post('/products',(req,res)=>{
    //res.json({message:"this res is to create req"})

    //get products from client
    const newProduct=req.body
    //console.log(req.body)
    //push product into products[]
    products.push(newProduct)

    //send res
    res.json({message:"product created"})
})

//update a product
productApp.put('/products',(req,res)=>{
    let modifiedProduct=req.body

    //get index of existing product in products array
    let index=products.findIndex(productObj=>productObj.id===modifiedProduct.id)

    //if product not found
    if(index===-1)
        return res.json({message:"product not found"})
    //update product with index
    products.splice(index,1,modifiedProduct)

    //send res
    res.json({message:"product updated"})

})

//delete product by id
productApp.delete('/products/:id',(req,res)=>{
    //res.json({message:"this res is to delete req"})

    //get id of product from url parameter
    let idOfUrl=Number(req.params.id)

    //find index of product
    let index=products.findIndex(productObj=>productObj.id===idOfUrl)
    //if product not found
    if(index===-1)
        return res.json({message:"product not found to delete"})
    
    //delete product by index
    products.splice(index,1)
    //send res
    res.json({message:"product deleted"})

})