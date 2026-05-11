import exp from "express";
import { EmpModel } from "../models/EmpModel.js";

export const empRoute = exp.Router();

// Create employee
empRoute.post("/employees", async (req, res, next) => {
  try {
    const newEmp = req.body;
    const empDoc = new EmpModel(newEmp);
    await empDoc.save();

    res.status(201).json({ message: "Emp created" });
  } catch (err) {
    next(err);
  }
});

// Read all employees
empRoute.get("/employees", async (req, res, next) => {
  try {
    const empList = await EmpModel.find();
    res.status(200).json({ message: "list of employees", payload: empList });
  } catch (err) {
    next(err);
  }
});

// Update employee
empRoute.put("/employees/:id", async (req, res, next) => {
  try {
    const modifiedEmp = req.body;

    const updatedEmp = await EmpModel.findByIdAndUpdate(
      req.params.id,
      { $set: modifiedEmp },
      { new: true } 
    );

    if (!updatedEmp) {
      return res.status(404).json({ message: "employee not found" });
    }

    res.status(200).json({
      message: "employee updated",
      payload: updatedEmp,
    });
  } catch (err) {
    next(err);
  }
});

// Delete employee
empRoute.delete("/employees/:id", async (req, res, next) => {
  try {
    const deletedEmp = await EmpModel.findByIdAndDelete(req.params.id);

    if (!deletedEmp) {
      return res.status(404).json({ message: "employee not found" });
    }

    res.status(200).json({
      message: "employee deleted",
      payload: deletedEmp,
    });
  } catch (err) {
    next(err);
  }
});