// app.js

import {addTask, getAllTasks, completeTask} from "./task.js";

// Add tasks
addTask("Coding", "medium", "2026-04-25");
addTask("Project", "high", "2026-05-10");

console.log(completeTask(1))

// Display tasks again
console.log(getAllTasks());

