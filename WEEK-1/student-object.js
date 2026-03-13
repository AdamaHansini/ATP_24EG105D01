let student={    //student is reference of object
    sno:20,
    fname:'kiran',
    lname:' sai',
    age:15,
    course:'BTECH',

    marks:[12,24,32,13],
    address:{
        city:'hyd',
        pincode:500070
    },
    getFullName:function(){
        return this.fname+this.lname
    },
    averageMarks:function(){
        let sum=0;
        for(let i=0;i<this.marks.length;i++)
            sum+=this.marks[i]
        return sum/this.marks.length;
    }

}    
console.log(student.getFullName())
console.log(student.averageMarks())
