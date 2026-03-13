//find the smallest element in marks array
let marks=[90,78,65,98]
let smallest=marks[0]
for(let i=0;i<marks.length;i++){
    if(smallest>marks[i])
        smallest=marks[i]
}
console.log("smallest:",smallest)

