document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and script running...");

  // Add event listeners for default task buttons
  document.getElementById("add-todo-button").addEventListener("click", function () {
      addTask("todo-board", "todo-input");
  });

  document.getElementById("add-progress-button").addEventListener("click", function () {
      addTask("progress-board", "progress-input");
  });

  document.getElementById("add-done-button").addEventListener("click", function () {
      addTask("done-board", "done-input");
  });

  // Ensure Add New Board button is working
  const addBoardBtn = document.getElementById("add-new-board-button");
  if (addBoardBtn) {
      addBoardBtn.addEventListener("click", addNewBoard);
  } else {
      console.error("Error: Add New Board button not found!");
  }

  // Load saved tasks and initialize drag-and-drop
  loadFromLocalStorage();
  initializeDragAndDrop();
});

// Function to load data from local storage
function loadFromLocalStorage() {
  const savedData = JSON.parse(localStorage.getItem("kanbanBoard")) || {};
  Object.keys(savedData).forEach((boardId) => {
      const taskList = document.getElementById(`${boardId}-task-list`);
      if (taskList) {
          savedData[boardId].forEach((task) => {
              const taskElement = createTaskElement(task.id, task.content);
              taskList.appendChild(taskElement);
          });
      }
  });
  updateTaskCounts();
}

// Function to save data to local storage
function saveToLocalStorage() {
  const boards = document.querySelectorAll(".board");
  const boardData = {};

  boards.forEach((board) => {
      const boardId = board.id.replace("-board", "");
      const taskList = board.querySelectorAll(".task");
      const tasks = [];

      taskList.forEach((task) => {
          tasks.push({ id: task.id, content: task.querySelector(".task-content").innerText });
      });

      boardData[boardId] = tasks;
  });

  localStorage.setItem("kanbanBoard", JSON.stringify(boardData));
}

// Function to create a task element
function createTaskElement(taskId, taskContent) {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.id = taskId;

  task.innerHTML = `
      <span class="task-content">${taskContent}</span>
      <div class="task-buttons">
          <button class="edit-task">Edit</button>
          <button class="delete-task">Delete</button>
      </div>
  `;

  task.addEventListener("dragstart", handleDragStart);
  task.addEventListener("dragend", handleDragEnd);

  task.querySelector(".edit-task").addEventListener("click", () => {
      editTask(task);
      saveToLocalStorage();
  });

  task.querySelector(".delete-task").addEventListener("click", () => {
      task.remove();
      updateTaskCounts();
      saveToLocalStorage();
  });

  return task;
}

// Function to add a new task
function addTask(boardId, inputId) {
  const board = document.getElementById(boardId);
  const input = document.getElementById(inputId);
  const taskList = board.querySelector(".task-list");

  if (input.value.trim() !== "") {
      const task = createTaskElement(`task-${Date.now()}`, input.value.trim());
      taskList.appendChild(task);
      input.value = "";

      updateTaskCounts();
      saveToLocalStorage();
  }
}

// Function to edit a task
function editTask(task) {
  const taskContent = task.querySelector(".task-content");
  const newContent = prompt("Edit your task:", taskContent.innerText);
  if (newContent && newContent.trim() !== "") {
      taskContent.innerText = newContent.trim();
  }
}

// Drag-and-drop functionality
function handleDragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
  event.target.classList.add("dragging");
}

function handleDragOver(event) {
  event.preventDefault();
  event.target.classList.add("dragover");
}

function handleDragLeave(event) {
  event.target.classList.remove("dragover");
}

function handleDrop(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain");
  const taskElement = document.getElementById(taskId);
  const taskList = event.target.closest(".task-list");

  if (taskList) {
      taskList.appendChild(taskElement);
      updateTaskCounts();
      saveToLocalStorage();
  }
  event.target.classList.remove("dragover");
}

function handleDragEnd(event) {
  event.target.classList.remove("dragging");
}

// Add drag-and-drop listeners to all task lists
function initializeDragAndDrop() {
  document.querySelectorAll(".task-list").forEach((taskList) => {
      taskList.addEventListener("dragover", handleDragOver);
      taskList.addEventListener("dragleave", handleDragLeave);
      taskList.addEventListener("drop", handleDrop);
  });
}

// Function to update task counts
function updateTaskCounts() {
  document.querySelectorAll(".board").forEach((board) => {
      const taskList = board.querySelector(".task-list");
      const count = board.querySelector("h3 span");
      count.innerText = taskList.childElementCount;
  });
  saveToLocalStorage();
}

// Function to add a new board
function addNewBoard() {
  const boardContainer = document.getElementById("board-container");

  console.log("Board Container:", boardContainer); // Debugging

  if (!boardContainer) {
      console.error("Error: board-container not found in the DOM.");
      return;
  }

  const newBoardId = `board-${Date.now()}`;

  // Create Board Element
  const newBoardElement = document.createElement("div");
  newBoardElement.classList.add("board");
  newBoardElement.id = newBoardId;

  // Add Board Title
  const boardTitle = document.createElement("h3");
  boardTitle.innerHTML = `New Board (<span>0</span>)`;
  newBoardElement.appendChild(boardTitle);

  // Create Task Input & Button Container
  const searchContainer = document.createElement("div");
  searchContainer.classList.add("search-container");

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.id = `${newBoardId}-input`;
  inputField.placeholder = "Write Here";

  const addButton = document.createElement("button");
  addButton.id = `${newBoardId}-add-button`;
  addButton.innerText = "Add Task";

  // Append input and button to search container
  searchContainer.appendChild(inputField);
  searchContainer.appendChild(addButton);
  newBoardElement.appendChild(searchContainer);

  // Create Task List
  const taskList = document.createElement("div");
  taskList.classList.add("task-list");
  taskList.id = `${newBoardId}-task-list`;
  newBoardElement.appendChild(taskList);

  // Append board to container
  boardContainer.appendChild(newBoardElement);

  // Add event listener for new board's "Add Task" button
  addButton.addEventListener("click", function () {
      addTask(newBoardId, `${newBoardId}-input`);
  });

  initializeDragAndDrop(); // Reinitialize drag-and-drop for the new board
  updateTaskCounts();
}