import {Schema,model} from 'mongoose'

//create product schema(productId,productName,price,brand)

const productSchema=new Schema({
    //new is an operator
    //structure of product resource
    productId:{
        type:String,
        //string --- js datatype
        //String --- mongoose Schema type
        required:[true,"productId is mandatory field"],
        
    },
    productName:{
        type:String,
        required:[true,"password is required"]
    },
    price:{
        type:Number,
        required:[true,"price reequired"],
        min:[10000,"minimum price is 10000"],
        max:[50000,"maximum price is 50000"],
        required:[true,"price is mandatory"]
    },
    brand:{
        type:String,
        required:[true,"brand is required"]
    }
},
    {
        versionKey:false,
        timestamps:true
    }


);


//generate productModel

export const ProductModel=model("product",productSchema)
