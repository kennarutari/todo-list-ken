document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("todo-form");
  const taskInput = document.getElementById("input-task");
  const dateInput = document.getElementById("due-date");
  const addButton = document.getElementById("add-button");
  const taskList = document.querySelector(".task-nya");
  const filterSelect = document.getElementById("choose");
  const clearAllButton = document.getElementById("clear-all-button");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  renderTasks();

  form.addEventListener("submit", addTask);
  filterSelect.addEventListener("change", renderTasks);
  clearAllButton.addEventListener("click", clearAllTasks);

  function addTask(e) {
    e.preventDefault();

    const taskText = taskInput.value.trim();
    const taskDate = dateInput.value;

    if (taskText === "") {
      alert("Please enter a task!");
      taskInput.focus();
      return;
    }

    if (taskDate === "") {
      alert("Please select a date!");
      dateInput.focus();
      return;
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      date: taskDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    dateInput.value = "";
    taskInput.focus();
  }

  function deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
      tasks = tasks.filter((task) => task.id !== id);
      saveTasks();
      renderTasks();
    }
  }

  function toggleTaskCompletion(id) {
    tasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    saveTasks();
    renderTasks();
  }

  function clearAllTasks() {
    if (tasks.length === 0) {
      alert("No tasks to clear!");
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete ALL tasks? This cannot be undone!"
      )
    ) {
      tasks = [];
      saveTasks();
      renderTasks();
    }
  }

  function renderTasks() {
    const filter = filterSelect.value;

    let filteredTasks = tasks;
    if (filter === "pending") {
      filteredTasks = tasks.filter((task) => !task.completed);
    } else if (filter === "completed") {
      filteredTasks = tasks.filter((task) => task.completed);
    }

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.innerHTML = `
                <p>No tasks found</p>
                <p>Add a task using the form above!</p>
            `;
      taskList.appendChild(emptyState);
      return;
    }

    filteredTasks.forEach((task) => {
      const taskItem = document.createElement("li");
      taskItem.className = `task-item ${task.completed ? "completed" : ""}`;

      taskItem.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${
                      task.completed ? "checked" : ""
                    }>
                    <span class="task-text">${escapeHtml(task.text)}</span>
                </div>
                <span class="task-date">${formatDate(task.date)}</span>
                <div class="task-actions">
                    <button class="delete-btn" onclick="deleteTask(${
                      task.id
                    })">Delete</button>
                </div>
            `;

      const checkbox = taskItem.querySelector(".task-checkbox");
      checkbox.addEventListener("change", () => toggleTaskCompletion(task.id));

      taskList.appendChild(taskItem);
    });
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  window.deleteTask = deleteTask;
  window.toggleTaskCompletion = toggleTaskCompletion;

  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
});
