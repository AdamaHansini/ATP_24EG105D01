import { Schema,model } from "mongoose";

const empSchema=new Schema({
    empname:{
        type:String,
        required:[true,"name required"]
    },
    email:{
        type:String,
        required:[true,"email required"],
        unique:[true,"email already existed"]
    },
    mobile:{
        type:Number,
        required:[true,"mobile number required"]
    },
    designation:{
        type:String,
        required:[true,"designation required"]
    },
    companyName:{
        type:String,
        required:[true," company name required"]
    }
},
    {
        timestamps:true,
        versionKey:false,
        strict:"throw"
    }
)
export const EmpModel=model("emp",empSchema)