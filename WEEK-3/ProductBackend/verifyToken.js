import jwt from "jsonwebtoken"
const {verify}=jwt

export function verifyToken(req,res,next){
    //token verification logic
    
    //console.log("token object is ",req.cookies)
    //to access cookies property of request object we need cookie parser mmiddleware.otherwise req.cookies is undefined 
    //install cookies-parser
    //     npm i cookie-parser
    const token=req.cookies?.token
    console.log(token)
    //if toekn is undedfined
    if(!token){
        return res.status(401).json({message:"please login"})
    }
    try{
    //if token is existed
    const decodedToken=verify(token,'abcdef')
    console.log(decodedToken)
    req.user = decodedToken
    //attach decoded user to req
    next();
    }
    catch(err){
        res.status(401).json({messgae:"session expired.please relogin"})
    }
}