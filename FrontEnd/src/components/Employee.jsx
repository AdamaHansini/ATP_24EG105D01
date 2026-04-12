import React from 'react'
import { useLocation } from 'react-router'
function Employee() {
    //read state received in navigation
    const{state}=useLocation();
  return (
    <div className='bg-white p-10 text-3xl'>
      <p>Name:{state.empname}</p>
      <p>Email:{state.email}</p>
      <p>Phone Number:{state.mobile}</p>
      <p>Designation:{state.designation}</p>
      <p>Company Name:{state.companyName}</p>
    </div>
  )
}

export default Employee