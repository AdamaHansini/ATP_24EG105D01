// task.js

import {validateTitle, validatePriority, validateDueDate} from "./validator.js";

const tasks = [];

// Add task
function addTask(title, priority, dueDate){

    if(!validateTitle(title) || 
       !validatePriority(priority) || 
       !validateDueDate(dueDate)){
        return "Invalid Task";
    }

    const task = {
        id: tasks.length + 1,
        title,
        priority,
        dueDate,
        completed: false
    };

    tasks.push(task);

    return "Task Added";
}

// Get all tasks
function getAllTasks(){
    return tasks;
}

// Complete task
function completeTask(taskId){

    const task = tasks.find(t => t.id === taskId)

    if(!task){
        return "Not Completed"
    }

    task.completed = true
    return "Completed"

}

export {addTask, getAllTasks, completeTask};