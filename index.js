const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filter-category");
const sortBySelect = document.getElementById("sort-by");
const exportBtn = document.getElementById("export-tasks");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const priorityMap = {
  high: 1,
  medium: 2,
  low: 3
};

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  let visibleCount = 0;
  const search = searchInput.value.toLowerCase();
  const categoryFilterValue = filterCategory.value;
  const sortOption = sortBySelect.value;

  const categories = new Set();
  tasks.forEach(task => {
    if (task.category) categories.add(task.category);
  });

  updateCategoryFilter(categories);

  let sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.deadline ? new Date(a.deadline) : null;
    const dateB = b.deadline ? new Date(b.deadline) : null;
    const prioA = priorityMap[a.priority?.toLowerCase()] || 99;
    const prioB = priorityMap[b.priority?.toLowerCase()] || 99;

    switch (sortOption) {
      case "due-asc":
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA - dateB;

      case "due-desc":
        if (!dateA && !dateB) return 0;
        if (!dateA) return -1;
        if (!dateB) return 1;
        return dateB - dateA;

      case "priority-asc":
        return prioA - prioB;

      case "priority-desc":
        return prioB - prioA;

      case "name-asc":
        return a.name.localeCompare(b.name);

      case "name-desc":
        return b.name.localeCompare(a.name);

      default:
        return 0;
    }
  });

  sortedTasks.forEach(task => {
    // Defensive: some tasks might have no category - treat as empty string
    const taskCategory = task.category || "";

    if (
      (task.name.toLowerCase().includes(search) || taskCategory.toLowerCase().includes(search)) &&
      (categoryFilterValue === "" || taskCategory === categoryFilterValue)
    ) {
      visibleCount++;

      const li = document.createElement("li");
      li.classList.add(`priority-${task.priority?.toLowerCase() || "none"}`);
      if (task.done) li.classList.add("done");

      const daysLeft = task.deadline
        ? Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      // Get the original index in the main tasks array for correct button actions
      const originalIndex = tasks.indexOf(task);

      li.innerHTML = `
        <div class="task-header">
          <strong>${task.name}</strong>
          <span>${taskCategory || "No category"}</span>
        </div>
        <div class="task-meta">
          ${task.deadline ? `Due ${task.deadline} (${daysLeft} day${daysLeft === 1 ? '' : 's'} left)` : "No deadline"} |
          Priority: ${task.priority || "None"}
        </div>
        <div class="task-actions">
          <button onclick="toggleDone(${originalIndex})">${task.done ? "Undo" : "Mark as completed"}</button>
          <button onclick="editTask(${originalIndex})">Edit</button>
          <button onclick="deleteTask(${originalIndex})">Delete</button>
        </div>
      `;
      taskList.appendChild(li);
    }
  });

  if (visibleCount === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.style.textAlign = "center";
    emptyMessage.style.fontStyle = "italic";
    emptyMessage.style.color = "#555";
    emptyMessage.innerHTML = "🎉 Woohoo, no tasks left!";
    taskList.appendChild(emptyMessage);
  }
}

function updateCategoryFilter(categories) {
  const currentValue = filterCategory.value;
  filterCategory.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All Categories";
  filterCategory.appendChild(allOption);

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });

  if (currentValue && (currentValue === "" || categories.has(currentValue))) {
    filterCategory.value = currentValue;
  } else {
    filterCategory.value = "";
  }
}

function toggleDone(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  if (confirm("Delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
}

function editTask(index) {
  const task = tasks[index];
  document.getElementById("task-name").value = task.name;
  document.getElementById("task-category").value = task.category;
  document.getElementById("task-deadline").value = task.deadline;
  document.getElementById("task-priority").value = task.priority;

  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", e => {
  e.preventDefault();

  const newTask = {
    name: document.getElementById("task-name").value.trim(),
    category: document.getElementById("task-category").value.trim(),
    deadline: document.getElementById("task-deadline").value,
    priority: document.getElementById("task-priority").value.trim().toLowerCase(),
    done: false
  };

  if (newTask.name) {
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();
  }
});

searchInput.addEventListener("input", renderTasks);
filterCategory.addEventListener("change", renderTasks);
sortBySelect.addEventListener("change", renderTasks);

function exportTasks() {
  if (tasks.length === 0) {
    alert("No tasks to export!");
    return;
  }

  const content = tasks.map(task => {
    return [
      `Task: ${task.name}`,
      `Category: ${task.category || "None"}`,
      `Deadline: ${task.deadline || "None"}`,
      `Priority: ${task.priority || "None"}`,
      `Status: ${task.done ? "Done" : "Not done"}`,
      "--------------------------"
    ].join("\n");
  }).join("\n\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "homework_tasks.txt";
  a.click();
  URL.revokeObjectURL(url);
}

exportBtn.addEventListener("click", exportTasks);

renderTasks();
