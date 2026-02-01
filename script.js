// Task storage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let draggedTaskId = null;

const todo = document.getElementById("todo");
const done = document.getElementById("done");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("priority");
const addBtn = document.getElementById("addBtn");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  setupDragAndDrop();
  setupEventListeners();
});

function setupEventListeners() {
  addBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });
}

function setupDragAndDrop() {
  const containers = [todo, done];
  
  containers.forEach(container => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      container.style.background = "#e8f0ff";
    });

    container.addEventListener("dragleave", (e) => {
      if (e.target === container) {
        container.style.background = "#f7f8fa";
      }
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      container.style.background = "#f7f8fa";
      
      if (draggedTaskId !== null) {
        const newStatus = container.id === "todo" ? "todo" : "done";
        const task = tasks.find(t => t.id === draggedTaskId);
        if (task) {
          task.status = newStatus;
          saveTasks();
          renderTasks();
        }
      }
    });
  });
}

function addTask() {
  const title = taskInput.value.trim();
  
  if (!title) {
    alert("Please enter a task");
    return;
  }

  const task = {
    id: Date.now(),
    title: title,
    priority: prioritySelect.value,
    status: "todo",
    hours: 0,
    created: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

function markAsDone(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = task.status === "done" ? "todo" : "done";
    saveTasks();
    renderTasks();
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks();
  renderTasks();
}

function addHours(taskId, hoursToAdd) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.hours = (task.hours || 0) + parseFloat(hoursToAdd);
    if (task.hours < 0) task.hours = 0;
    saveTasks();
    renderTasks();
  }
}

function setHours(taskId, hours) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.hours = parseFloat(hours) || 0;
    if (task.hours < 0) task.hours = 0;
    saveTasks();
    renderTasks();
  }
}

function renderTasks() {
  todo.innerHTML = "";
  done.innerHTML = "";

  const todoTasks = tasks.filter(t => t.status === "todo");
  const doneTasks = tasks.filter(t => t.status === "done");
  const totalHours = tasks.reduce((sum, t) => sum + (t.hours || 0), 0);

  todoTasks.forEach(task => createTaskCard(task, todo));
  doneTasks.forEach(task => createTaskCard(task, done));

  // Update stats
  document.getElementById("todoCount").textContent = todoTasks.length;
  document.getElementById("doneCount").textContent = doneTasks.length;
  document.getElementById("hoursCount").textContent = totalHours.toFixed(1);
}

function createTaskCard(task, container) {
  const card = document.createElement("div");
  card.className = "task";
  card.draggable = true;
  card.dataset.id = task.id;

  if (task.status === "done") {
    card.classList.add("done-card");
  }

  card.addEventListener("dragstart", () => {
    draggedTaskId = task.id;
    card.style.opacity = "0.6";
  });

  card.addEventListener("dragend", () => {
    draggedTaskId = null;
    card.style.opacity = "1";
  });

  const statusButtonText = task.status === "done" ? "Undo" : "Mark Done";
  const statusButtonClass = task.status === "done" ? "btn-undo" : "btn-done";
  const taskHours = task.hours || 0;

  card.innerHTML = `
    <div class="task-title">${escapeHtml(task.title)}</div>

    <div class="task-meta">
      <span class="badge ${task.priority}">${task.priority}</span>
      <span class="assignee">You</span>
    </div>

    <div class="task-meta">Created: ${task.created}</div>

    <div class="hours-section">
      <label>⏱️ Hours: <strong>${taskHours}h</strong></label>
      <div class="hours-input">
        <button class="hours-btn" onclick="addHours(${task.id}, -0.5)">−</button>
        <input type="number" step="0.5" min="0" value="${taskHours}" 
               onchange="setHours(${task.id}, this.value)" class="hours-field">
        <button class="hours-btn" onclick="addHours(${task.id}, 0.5)">+</button>
      </div>
    </div>

    ${
      task.status === "done"
        ? `<div class="task-meta"><span class="done-status">Done</span></div>`
        : ""
    }

    <div class="task-actions">
      <button class="btn-small ${statusButtonClass}" onclick="markAsDone(${task.id})">${statusButtonText}</button>
      <button class="btn-small btn-delete" onclick="deleteTask(${task.id})">Delete</button>
    </div>
  `;

  container.appendChild(card);
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
