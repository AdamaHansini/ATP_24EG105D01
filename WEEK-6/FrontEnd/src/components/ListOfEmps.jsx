import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Employee from "./Employee";
import { counterContextObj } from "../contexts/ContextProvider";
import { useContext } from "react";
import axios from "axios";
function ListOfEmps() {

    const {counter,changeCounter}=useContext(counterContextObj)
  
  const [emps, setEmps] = useState([]);
  const navigate=useNavigate()

  const gotoEmployee=(empObj)=>{
    //navigate employee with selected employee object
    navigate("/employee",{state:empObj})
  };

  const gotoEdit=(empObj)=>{
    //navigate to /employee along with selected employee object
    navigate("/edit",{state:empObj})
  }

  const deleteEmpById=async(id)=>{
    let res=await axios.delete(`https://atp-24eg105d01-employee.onrender.com/emp-api/employees/${id}`)
    if(res.status===200){
      //get latest employess data
      getEmps();
    }
  }

  //get all employees
  async function getEmps() {
      let res = await fetch("https://atp-24eg105d01-employee.onrender.com/emp-api/employees");
      if (res.status === 200) {
        let resObj = await res.json();
        setEmps(resObj.payload);
      }
    }
   
  useEffect(() => {
     getEmps();
  }, []);

  return (
    <div className="text-center ">
      <div className="text-center">
      <h1 className='text-4xl'>Counter:{counter}</h1>
    <button onClick={changeCounter} className='bg-pink-700 p-3 mt-5 text-white mb-5'>Change</button>
    </div>
      <h1 className="text-4xl text-center">List of Employees</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-5 ">
        {emps.map((empObj) => (
          <div key={empObj._id} className=" bg-white p-5 rounded-2xl">
            <p>{empObj.empname}</p>
            <p className="mb-3">{empObj.email}</p>
            {/*3 buttons for edit ,view and delete*/}
            <div className="flex justify-around">
              <button onClick={()=>gotoEmployee(empObj)} className="bg-pink-700 text-white p-2 rounded-1xl" >View</button>
              <button onClick={()=>gotoEdit(empObj)} className="bg-pink-700 text-white p-2 rounded-1xl">Edit</button>
              <button onClick={()=>deleteEmpById(empObj._id)} className="bg-pink-700 text-white p-2 rounded-1xl">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListOfEmps;