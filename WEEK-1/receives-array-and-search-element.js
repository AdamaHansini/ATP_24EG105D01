/*write a function that receives an array and search element as args and returns 
   the index of that search element in the array.It should return "not found" when 
   search element not found*/
function searchElement(a,b){
    let key=b
    for(let i=0;i<a.length;i++){
        if(a[i]==key)
            return i;
    }
    return "not found"
}
let search=searchElement([10,20,30],20)
console.log(search)