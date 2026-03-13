// 2.OTP Countdown Simulator (Console App)
// ------------------------------------
        
//         Simulate OTP sending flow in Node.js:
        
//         Show “OTP Sent Successfully”
console.log("OTP Sent Successfully")
        
//         Start 10-second countdown
// let sec=10

// setInterval(()=>{
//         sec--
//         console.log(sec)
// },1000)
// setInterval(()=>{
//     console.log("Resend OTP")
// },10000)
//         Allow resend only after countdown ends

let seconds=10;
let intervalId=setInterval(()=>{
    seconds--
    console.log(seconds)

    if(seconds===0){
        console.log('Resend OTP')
        clearInterval(intervalId)
    }
},1000)