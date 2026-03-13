//write a function that recieves three numbers args and return the big number
function bigOfThree(a,b,c){
    if(a>b && a>c)
        return a;
    else if(b>a && b>c)
        return b;
    else 
        return c;
}
let big=bigOfThree(10,15,12)
console.log("big:",big)