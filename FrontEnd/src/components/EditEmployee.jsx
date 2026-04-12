import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation,useNavigate } from 'react-router';
import Employee from './Employee';
import { useEffect } from 'react';
import axios from 'axios'


function EditEmployee() {
const {
  register,
  handleSubmit,
  formState: { errors },
  setValue
} = useForm();


const navigate=useNavigate()

//get data from employee object from navigate hook
const {state}=useLocation();

useEffect(()=>{
  setValue("empname",state.empname)
  setValue("email",state.email)
  setValue("mobile",state.mobile)
  setValue("designation",state.designation)
  setValue("companyName",state.companyName)

},[])


const saveModifiedEmp=async(modifiedEmp)=>{
  //make HTTP PUT request
  const res=await axios.put(`http://localhost:4000/emp-api/employees/${state._id}`,modifiedEmp)
  if(res.status===200){
    //naviagte to ListOfEmployees
    navigate('/list')
  }
}

  return (
    <div><h1 className="text-5xl text-center text-emerald-700">Edit Employee</h1>
      {/* form */}
      <form className=" max-w-md mx-auto mt-10" onSubmit={handleSubmit(saveModifiedEmp)}>
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
          disabled
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

        <button type="submit" className="text-2xl rounded-1xl bg-green-700 text-white block mx-auto p-4 mt-5">
          Save
        </button>
      </form></div>
  )
}

export default EditEmployee