// payment.js

import {reduceStock} from './product.js'
import {getCartItems,getCartTotal,clearCart} from './cart.js'
import {applyDiscount} from './discount.js'

export function processPayment(method,couponCode=null){

 const items=getCartItems()
 const subtotal=getCartTotal()

 let discount=0
 let finalTotal=subtotal

 if(couponCode){
  const result=applyDiscount(subtotal,couponCode)
  discount=result.discount
  finalTotal=result.finalTotal
 }

 if(!validatePaymentMethod(method))
  return {status:"failed",message:"Invalid payment method"}

 items.forEach(item=>{
  reduceStock(item.productId,item.quantity)
 })

 clearCart()

 return{
  orderId:generateOrderId(),
  items,
  subtotal,
  discount,
  total:finalTotal,
  paymentMethod:method,
  status:"success"
 }
}

export function validatePaymentMethod(method){

 const methods=["card","upi","cod"]

 return methods.includes(method)
}

function generateOrderId(){
 return "ORD"+Date.now()
}