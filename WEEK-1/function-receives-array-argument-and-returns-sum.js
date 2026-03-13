//write a function that receives an array as arg and returns their sum
function sumArray(a){
    let sum=0
    for(let i=0;i<a.length;i++){
        sum+=a[i]
    }
    return sum;
}
let sum=sumArray([15,20,15])
console.log(sum)