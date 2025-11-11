// ====== Select elements ======
const taskInput = document.querySelector('.taskinput');
const addTaskBtn = document.querySelector('.addtaskbtn');
const taskList = document.querySelector('.task-list');
const clearTasksBtn = document.querySelector('#clear-tasks-btn');
const taskFilter = document.querySelector('#taskFilter'); // Top dropdown
const filterButtons = document.querySelectorAll('.filter-btn'); // Bottom buttons
const taskCount = document.querySelector('.task-count');
const searchBar = document.querySelector('#search-bar');

let tasks = []; // Array to store all tasks

// ====== Load tasks from local storage ======
window.addEventListener('DOMContentLoaded', () => {
  tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => renderTask(task));
  updateTaskCount();
  applyFilters();
});

// ====== Add Task ======
addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text,
    completed: false
  };

  tasks.push(newTask);
  renderTask(newTask);
  saveTasks();
  taskInput.value = '';
  updateTaskCount();
  applyFilters();
});

// ====== Render Task ======
function renderTask(task) {
  const taskEl = document.createElement('div');
  taskEl.classList.add('task-item');
  if (task.completed) taskEl.classList.add('completed');
  taskEl.dataset.id = task.id;

  taskEl.innerHTML = `
    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
    <span class="task-text">${task.text}</span>
    <div class="task-buttons">
      <button class="edit-task">✏️</button>
      <button class="delete-task">❌</button>
    </div>
  `;

  const checkbox = taskEl.querySelector('.task-checkbox');
  const taskText = taskEl.querySelector('.task-text');

  // Toggle completed
  checkbox.addEventListener('change', () => {
    taskEl.classList.toggle('completed', checkbox.checked);
    const taskIndex = tasks.findIndex(t => t.id == task.id);
    tasks[taskIndex].completed = checkbox.checked;
    saveTasks();
    updateTaskCount();
    applyFilters();
  });

  // Edit task
  taskEl.querySelector('.edit-task').addEventListener('click', (e) => {
    e.stopPropagation();
    const newText = prompt("Edit your task:", task.text);
    if (newText && newText.trim() !== "") {
      taskText.textContent = newText;
      const taskIndex = tasks.findIndex(t => t.id == task.id);
      tasks[taskIndex].text = newText;
      saveTasks();
      applyFilters();
    }
  });

  // Delete task
  taskEl.querySelector('.delete-task').addEventListener('click', (e) => {
    e.stopPropagation();
    taskEl.remove();
    tasks = tasks.filter(t => t.id != task.id);
    saveTasks();
    updateTaskCount();
  });

  taskList.appendChild(taskEl);
}

// ====== Save to Local Storage ======
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ====== Update Task Count ======
function updateTaskCount() {
  const activeTasks = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${activeTasks} items left`;
}

// ====== Clear All ======
clearTasksBtn.addEventListener('click', () => {
  tasks = [];
  taskList.innerHTML = '';
  saveTasks();
  updateTaskCount();
});

// ====== Apply filters (dropdown + bottom buttons + search) ======
function applyFilters() {
  const filterValue = taskFilter.value;
  const searchText = searchBar.value.toLowerCase();

  document.querySelectorAll('.task-item').forEach(taskEl => {
    const taskText = taskEl.querySelector('.task-text').textContent.toLowerCase();
    const isCompleted = taskEl.classList.contains('completed');
    let matchesFilter = true;

    // Filter by dropdown
    if (filterValue === 'pending') matchesFilter = !isCompleted;
    else if (filterValue === 'completed') matchesFilter = isCompleted;

    // Filter by search
    if (searchText && !taskText.includes(searchText)) matchesFilter = false;

    taskEl.style.display = matchesFilter ? 'flex' : 'none';
  });
}

// ====== Top dropdown filter ======
taskFilter.addEventListener('change', () => {
  applyFilters();
  // Sync bottom buttons
  filterButtons.forEach(btn => btn.classList.remove('active'));
  if (taskFilter.value === 'all') document.querySelector('[data-filter="all"]').classList.add('active');
  else if (taskFilter.value === 'completed') document.querySelector('[data-filter="completed"]').classList.add('active');
  else if (taskFilter.value === 'pending') document.querySelector('[data-filter="active"]').classList.add('active');
});

// ====== Bottom filter buttons ======
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Sync dropdown
    if (button.dataset.filter === 'all') taskFilter.value = 'all';
    else if (button.dataset.filter === 'active') taskFilter.value = 'pending';
    else if (button.dataset.filter === 'completed') taskFilter.value = 'completed';

    applyFilters();
  });
});

// ====== Search bar ======
searchBar.addEventListener('input', applyFilters);
searchBar.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') e.preventDefault(); // Prevent form submission
});
