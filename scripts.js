import { initialTasks } from "./initialData.js";

/** 
 * Handles loading and saving tasks to localStorage.
 * Manages rendering tasks to the UI and modal interactions.
 */ 
// Local storage key
const STORAGE_KEY = 'kanban-tasks';

// Get tasks from local storage or use initial tasks
function getTasks() {
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  if (storedTasks) {
    return JSON.parse(storedTasks);
  } else {
    // Save initial tasks to local storage for first-time users
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
    return initialTasks;
  }
}

// Save tasks to local storage
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Get current tasks
let currentTasks = getTasks();

/**
 * Creates a single task DOM element.
 * @param {Object} task - Task data object.
 * @param {string} task.title - Title of the task.
 * @param {number} task.id - Unique task ID.
 * @param {string} task.status - Status column: 'todo', 'doing', or 'done'.
 * @returns {HTMLElement} The created task div element.
 */
function createTaskElement(task) {
  const taskDiv = document.createElement("div");
  taskDiv.className = "task-div";
  taskDiv.textContent = task.title;
  taskDiv.dataset.taskId = task.id;

  taskDiv.addEventListener("click", () => {
    openTaskModal(task);
  });

  return taskDiv;
}

/**
 * Finds the task container element based on task status.
 * @param {string} status - The task status ('todo', 'doing', or 'done').
 * @returns {HTMLElement|null} The container element, or null if not found.
 */
function getTaskContainerByStatus(status) {
  const column = document.querySelector(`.column-div[data-status="${status}"]`);
  return column ? column.querySelector(".tasks-container") : null;
}

/**
 * Clears all existing task-divs from all task containers.
 */
function clearExistingTasks() {
  document.querySelectorAll(".tasks-container").forEach((container) => {
    container.innerHTML = "";
  });
}

/**
 * Renders all tasks from initial data to the UI.
 * Groups tasks by status and appends them to their respective columns.
 * @param {Array<Object>} tasks - Array of task objects.
 */
function renderTasks(tasks) {
  tasks.forEach((task) => {
    const container = getTaskContainerByStatus(task.status);
    if (container) {
      const taskElement = createTaskElement(task);
      container.appendChild(taskElement);
    }
  });
}

/**
 * Opens the modal dialog with pre-filled task details.
 * @param {Object} task - The task object to display in the modal.
 */
function openTaskModal(task) {
  const modal = document.getElementById("task-modal");
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");
  const statusSelect = document.getElementById("task-status");
  const saveBtn = document.getElementById("save-task-btn");

  titleInput.value = task.title;
  descInput.value = task.description;
  statusSelect.value = task.status;

  // hide create button when viewing existing task
  saveBtn.style.display = "none";

  modal.showModal();
}

function openNewTaskModal() {
  const modal = document.getElementById("task-modal");
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");
  const statusSelect = document.getElementById("task-status");
  const saveBtn = document.getElementById("save-task-btn");

  // reset inputs
  titleInput.value = "";
  titleInput.placeholder = "e.g., Rest";
  descInput.value = "";
  descInput.placeholder = "e.g., Take a nap";
  statusSelect.value = "todo";

  // show create button when creating new task
  saveBtn.style.display = "block";

  modal.showModal();

}

//open new task modal
function setupSaveTaskHandler() {
  const form = document.getElementById("task-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const modal = document.getElementById("task-modal");
    const titleInput = document.getElementById("task-title");
    const descInput = document.getElementById("task-desc");
    const statusSelect = document.getElementById("task-status");

    // create a new task
    const newTask = {
      id: currentTasks.length + 1,
      title: titleInput.value,
      description: descInput.value,
      status: statusSelect.value,
    };
    // add to current tasks array
    currentTasks.push(newTask);

    // save to local storage
    saveTasks(currentTasks);

   const container = getTaskContainerByStatus(newTask.status);
    if (container) {
      const taskElement = createTaskElement(newTask);
      container.appendChild(taskElement);
    }
    taskCounter();

    modal.close();
  });
  
  const addTaskBtn = document.getElementById("add-task-btn");
  addTaskBtn.addEventListener("click", () => {
    openNewTaskModal();
  });
}
/** add task counters to column headers
 * @param {string} status - The task status ('todo', 'doing', or 'done').   
 * 
 */
function taskCounter() {
  const todoCount = currentTasks.filter(function (task) {
    return task.status === "todo";
  }).length;
  const doingCount = currentTasks.filter(function (task) {
    return task.status === "doing";
  }).length;
  const doneCount = currentTasks.filter(function (task) {
    return task.status === "done";
  }).length;

  document.getElementById("toDoText").textContent = `TODO (${todoCount})`;
  document.getElementById("doingText").textContent = `DOING (${doingCount})`;
  document.getElementById("doneText").textContent = `DONE (${doneCount})`;
}

/**
 * Sets up modal close behavior.
 */
function setupModalCloseHandler() {
  const modal = document.getElementById("task-modal");
  const closeBtn = document.getElementById("close-modal-btn");

  closeBtn.addEventListener("click", () => {
    modal.close();
  });
}

/**
 * Initializes the task board and modal handlers.
 */
function initTaskBoard() {
  clearExistingTasks();
  renderTasks(currentTasks);
  taskCounter();
  setupModalCloseHandler();
  setupSaveTaskHandler();
}

// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", initTaskBoard);
