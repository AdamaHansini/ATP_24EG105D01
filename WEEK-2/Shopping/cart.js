// cart.js

import {getProductById,checkStock} from './product.js'

let cartItems=[]

export function addToCart(productId,quantity){

 const product=getProductById(productId)

 if(!product)
  return "Product not found"

 if(!checkStock(productId,quantity))
  return "Not enough stock"

 const item=cartItems.find(i=>i.productId===productId)

 if(item)
  item.quantity+=quantity
 else
  cartItems.push({productId,quantity})

 return "Added to cart"
}

export function removeFromCart(productId){
 cartItems=cartItems.filter(i=>i.productId!==productId)
 return "Item removed"
}

export function updateQuantity(productId,newQuantity){

 if(!checkStock(productId,newQuantity))
  return "Not enough stock"

 const item=cartItems.find(i=>i.productId===productId)

 if(item){
  item.quantity=newQuantity
  return "Quantity updated"
 }

 return "Item not found"
}

export function getCartItems(){

 return cartItems.map(item=>{
  const product=getProductById(item.productId)
  return {
   name:product.name,
   price:product.price,
   quantity:item.quantity
  }
 })
}

export function getCartTotal(){

 let total=0

 cartItems.forEach(item=>{
  const product=getProductById(item.productId)
  total += product.price * item.quantity
 })

 return total
}

export function clearCart(){
 cartItems=[]
}