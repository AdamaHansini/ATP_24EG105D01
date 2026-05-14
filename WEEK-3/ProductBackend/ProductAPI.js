//create mini-express application(Seperate route)
//mini-express application donot need the server


import exp from "express"
import {ProductModel} from "../models/ProductModel.js"


export const productApp=exp.Router()


//define product rest api
    //create new product
    
    productApp.post("/products",async(req,res)=>{
        //get new product obj from req
        const newProduct=req.body;
        
        //create new product document
        const newProductDocument=new ProductModel(newProduct)
        //save 
        const result=await newProductDocument.save()
        console.log(result)
        //send res
        res.status(201).json({message:"product created"})
    })

    //read all products
    productApp.get("/products",async(req,res)=>{
        //read all products from db
        let productList=await ProductModel.find();
        //send res
        res.json(productList)
    })

    //read products by objID
    productApp.get("/products/:id",async(req,res)=>{
        //read object by id from req params 
        const pid=req.params.id
        //find product by id
        const productObj=await ProductModel.findById(pid)
        //if product not found
        if(!productObj){
           res.status(404).json({message:"product not found"})
        }else{
        //if(!productObj){
        //   res.status(404).json({message:"product not found"})
        //}
        //send res
        
        res.status(200).json({message:"product",payload:productObj})
        }
    })

    //update a product by id
    productApp.put("/products/:id",async(req,res)=>{
        const modifiedProduct=req.body
        const pid=req.params.id
        //find product by id
        const updateProduct=await ProductModel.findByIdAndUpdate(pid,
            {$set:{...modifiedProduct}},
            {new:true,runValidators:true});
        //send res
        res.status(200).json({message:"product modified",payload:updateProduct})
    })
    //delete a product by id
    productApp.delete("/products/:id",async(req,res)=>{
        
        const pid=req.params.id
        //find product by id
        const deleteProduct=await ProductModel.findByIdAndDelete(pid);
        if(!deleteProduct){
            return res.status(404).json({message:"product not found"})
        }
        //send res
        res.status(200).json({message:"product deleted",payload:deleteProduct})
    })
