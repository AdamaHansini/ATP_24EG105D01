import exp from "express"
import {connect} from 'mongoose'
import { userApp } from "./APIs/UserAPI.js"
import {productApp} from "./APIs/ProductAPI.js"
import cookieParser from "cookie-parser"
import { ProductModel } from "./models/ProductModel.js"
import {config} from 'dotenv'

config();//process.env.port,  process.env.db_url

const app=exp()
//add body parser
app.use(exp.json())
app.use(cookieParser())
//forward req to userapp if path starts with /user-api
app.use("/user-api",userApp)
app.use("/product-api",productApp)

//start server
const port=process.env.PORT||4000
//connect to DB server
//connect("").then().catch()
async function connectDB(){
    try{
    await connect("DB_URL")
    app.listen(4000,()=>console.log("server on port 4000.."))

    console.log("DB connection success")
    }catch(err){
        console.log("err in DB connection:",err)
    }
}
connectDB()

app.use((err,req,res,next)=>{
    console.log(err.name)
    console.log(err)
    //validation error
    if(err.name==='ValidationError'){
        return res.status(400).json({message:"error occured",error:err.message})
    }
    //cast error
    if(err.name==='CastError'){
        return res.status(400).json({message:"error occured",error:err.message})
    }
    //send server side error
    res.status(500).json({message:"server side error",error:err.msg})

})

//error=>{name,message,callStack}