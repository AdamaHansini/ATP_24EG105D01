import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router";
import {counterContextObj} from "../contexts/ContextProvider";
import { useContext } from "react";

function CreateEmp() {
  const {counter,changeCounter}=useContext(counterContextObj)

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  //form submit
  const onFormSubmit = async (newEmpObj) => {
    try {
      setLoading(true);
      //make HTTP POST req
      let res = await fetch("https://atp-24eg105d01-employee.onrender.com/emp-api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmpObj),
      });

      if (res.status === 201) {
        //navigate to employees component programatically
        navigate("/list");
      } else {
        let errorRes = await res.json();
        console.log("error responce is ", errorRes);
        throw new Error(errorRes.reason);
      }
    } catch (err) {
      console.log("err in catch", err);
      //deal with err
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  console.log(error);

  if (loading) {
    return <p className="text-center text-4xl">Loading.......</p>;
  }
  if (error) {
    return <p className="text-red-500 text-center text-3xl">{error}</p>;
  }

  return (
    <div>
      <div className="text-center">
      <h1 className='text-4xl'>Counter:{counter}</h1>
    <button onClick={changeCounter} className='bg-pink-700 p-3 mt-5 text-white mb-5'>Change</button>
    </div>
      <h1 className="text-5xl text-center text-black">Create New Employee</h1>
      {/* form */}
      <form className=" max-w-md mx-auto mt-10" onSubmit={handleSubmit(onFormSubmit)}>
        <input
          type="text"
          placeholder="Name "
          {...register("empname")}
          className="mb-3 bg-cyan-50 p-3 w-full rounded-1xl"
        />
        <input
          type="email"
          placeholder="Email "
          {...register("email")}
          className="mb-3 bg-cyan-50 p-3 w-full rounded-1xl"
        />

        <input
          type="number"
          placeholder="Mobile number"
          {...register("mobile")}
          className="mb-3 bg-cyan-50 p-3 w-full rounded-1xl"
        />
        <input
          type="text"
          placeholder="Designation"
          {...register("designation")}
          className="mb-3 bg-cyan-50 p-3 w-full rounded-1xl"
        />
        <input
          type="text"
          placeholder="Company Name"
          {...register("companyName")}
          className="mb-3 bg-cyan-50 p-3 w-full rounded-1xl"
        />

        <button type="submit" className="text-2xl rounded-1xl bg-pink-700 text-white block mx-auto p-4 mt-5">
          Add Emp
        </button>
      </form>
    </div>
  );
}

export default CreateEmp;