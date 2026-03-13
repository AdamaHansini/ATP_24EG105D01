//ASSIGNMENT 4: 
//------------
//Movie Streaming Platform

//You are working on a movie recommendation system.

//Test data:
const movies = [
  { id: 1, title: "Inception", genre: "Sci-Fi", rating: 8.8 },
  { id: 2, title: "Joker", genre: "Drama", rating: 8.4 },
  { id: 3, title: "Avengers", genre: "Action", rating: 8.0 },
  { id: 4, title: "Interstellar", genre: "Sci-Fi", rating: 8.6 }
];


//Tasks:
    //1. filter() only "Sci-Fi" movies

    let d1=movies.filter((mvObj)=>mvObj.genre==="Sci-Fi")
    console.log(d1)

    //2. map() to return:
        //    "Inception (8.8)"

    let d2=movies.map((mvObj)=>{
        if(mvObj.rating===8.8)
  return mvObj.title+mvObj.rating})
    console.log(d2)

    //3. reduce() to find average movie rating
    let d3=movies.reduce((acc,mvObj)=>acc+mvObj.rating,0)/movies.length
    console.log(d3)
    //4. find() movie "Joker"

    let d4=movies.find((mvObj)=>mvObj.title==='Joker')
    console.log(d4)

    //5. findIndex() of "Avengers"
    let d5=movies.findIndex((mvObj)=>mvObj.title==='Avengers')
    console.log(d5)
