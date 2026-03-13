//Problem Statement: Library Book Management System
//-------------------------------------------------
//Objective : Create a Book class and use it to manage a collection of books in a library.

//Requirements:
 // Create a Book class with the following:

  //Properties:
    //  title (string)
    //  author (string)
    //  pages (number)
   //   isAvailable (boolean, default: true)
class Book{
    title;
    author;
    pages;
    isAvailable=true;
     


 // Methods:
    //  borrow() - Marks the book as not available
    //  returnBook() - Marks the book as available
    //  getInfo() - Returns a string with book details (e.g., "The Hobbit by J.R.R. Tolkien (310 pages)")
    //  isLongBook() - Returns true if pages > 300, false otherwise
    constructor(title,author,pages){
        this.title=title;
        this.author=author;
        this.pages=pages;
    }

    borrow(){
        if(this.isAvailable){
            this.isAvailable=false
        return "borrowed"
    }
    return "unavailable"
    }

    returnBook(){
        this.isAvailable=true
        return "returned"
    }

    getInfo(){
        return (` ${this.title} by ${this.author} and pages are ${this.pages}`)
    }

    isLongBook(){
        if(this.pages>300)
            return true
        else 
            return false
    }



}

  //1. Create at least 5 book objects using the class:
    //  Example: "Harry Potter", "1984", "The Hobbit", etc.
const library=[new Book("Harry Potter","Abc",150),
new Book("Harry ","def",250),
new Book("Potter","ghi",350),
new Book("beautiful world","jkl",150),
new Book("people","mno",450)]
//   2. Perform the following operations:

//       i. Display info of all books

library.forEach((book)=>
    console.log(book.getInfo()))

//       ii. Borrow 2 books and show their availability status
console.log(library[0].borrow())
console.log(`available:${library[0].isAvailable}`)
//       iii. Return 1 book and show updated status
console.log(library[0].returnBook())
console.log(`available:${library[0].isAvailable}`)
//       iv. Count how many books are "long books" (more than 300 pages)
let long=library.filter((book)=>book.isLongBook()).length
console.log("long books are:",long)
//       v. List all available books
let available=library.filter((book)=>book.isAvailable)
available.forEach(book=>console.log(book.title))