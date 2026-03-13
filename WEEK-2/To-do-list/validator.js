// validator.js

// Validate task title
function validateTitle(title){
    if(!title) return false;
    if(title.length < 3) return false;
    return true;
}

// Validate priority
function validatePriority(priority){
    if(priority === "low" || priority === "medium" || priority === "high")
        return true;
    return false;
}

// Validate due date
function validateDueDate(date){
    let dueDate = new Date(date);
    let today = new Date();

    if(dueDate > today)
        return true;

    return false;
}

export {validateTitle, validatePriority, validateDueDate};