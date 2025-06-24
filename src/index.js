const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filter-category");
const sortBySelect = document.getElementById("sort-by");
const exportBtn = document.getElementById("export-tasks");
const exportJsonBtn = document.getElementById("export-json");
const importJsonBtn = document.getElementById("import-json-btn");
const importJsonInput = document.getElementById("import-json");
const submitBtn = taskForm.querySelector("button[type='submit']");
const cancelBtn = document.getElementById("cancel-edit");
const noTasksMessageBox = document.getElementById("no-tasks-message");
const endOfListMessage = document.getElementById("end-of-list-message");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let isEditing = false;
let editIndex = null;
let noTasksMessages = [];

const priorityMap = {
  high: 1,
  medium: 2,
  low: 3
};

function getRandomNoTasksMessage() {
  if (!noTasksMessages.length) return "🎉 No tasks left!";
  const index = Math.floor(Math.random() * noTasksMessages.length);
  return noTasksMessages[index];
}

function applyMessageStyle(el, text) {
  el.style.textAlign = "center";
  el.style.fontStyle = "italic";
  el.style.color = "#555";
  el.textContent = text;
}

function clearMessage(el) {
  el.textContent = "";
  el.removeAttribute("style");
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  clearMessage(noTasksMessageBox);
  clearMessage(endOfListMessage);

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
    if (a.done !== b.done) return a.done ? 1 : -1;

    const dateA = a.deadline ? new Date(a.deadline) : null;
    const dateB = b.deadline ? new Date(b.deadline) : null;
    const prioA = priorityMap[a.priority?.toLowerCase()] || 99;
    const prioB = priorityMap[b.priority?.toLowerCase()] || 99;

    switch (sortOption) {
      case "due-asc": return (dateA || Infinity) - (dateB || Infinity);
      case "due-desc": return (dateB || -Infinity) - (dateA || -Infinity);
      case "priority-asc": return prioA - prioB;
      case "priority-desc": return prioB - prioA;
      case "name-asc": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      default: return 0;
    }
  });

  sortedTasks.forEach(task => {
    const taskCategory = task.category || "";
    if (
      (task.name.toLowerCase().includes(search) || taskCategory.toLowerCase().includes(search)) &&
      (categoryFilterValue === "" || taskCategory === categoryFilterValue)
    ) {
      visibleCount++;

      const li = document.createElement("li");
      li.classList.add(`priority-${task.priority?.toLowerCase() || "none"}`);
      if (task.done) li.classList.add("done");

      const dateObj = task.deadline ? new Date(task.deadline) : null;
      const daysLeft = dateObj
        ? Math.ceil((dateObj - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      const deadlineText = dateObj
        ? `Due ${dateObj.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })} (${daysLeft} day${daysLeft === 1 ? '' : 's'} left)`
        : "No deadline";

      const completionText = task.doneAt
        ? `✅ Completed: ${new Date(task.doneAt).toLocaleString()}`
        : "";

      const originalIndex = tasks.indexOf(task);

      li.innerHTML = `
        <div class="task-header">
          <strong>${task.name}</strong>
          <span class="category-tag">${taskCategory || "No category"}</span>
        </div>
        <div class="task-meta">
          <span class="deadline">${deadlineText}</span>
          <span class="priority">${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "None"}</span>
          ${task.done ? `<span class="done-at">${completionText}</span>` : ""}
        </div>
        <div class="task-actions">
          <button onclick="toggleDone(${originalIndex})">${task.done ? "Mark as incomplete" : "Mark as completed"}</button>
          <button onclick="editTask(${originalIndex})">Edit task</button>
          <button onclick="deleteTask(${originalIndex})">Delete task</button>
        </div>
      `;
      taskList.appendChild(li);
    }
  });

  const allTasksComplete = tasks.length > 0 && tasks.every(task => task.done);

  if (visibleCount === 0 || allTasksComplete) {
    const msg = search
      ? `No tasks found for "${search}"`
      : getRandomNoTasksMessage();
    applyMessageStyle(noTasksMessageBox, msg);
  }

  if (visibleCount > 0 && !allTasksComplete) {
    applyMessageStyle(endOfListMessage, "📦 Looks like you've reached the end.");
  }
}

function updateCategoryFilter(categories) {
  const currentValue = filterCategory.value;
  filterCategory.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All categories";
  filterCategory.appendChild(allOption);

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });

  if (categories.has(currentValue)) {
    filterCategory.value = currentValue;
  }
}

function toggleDone(index) {
  const task = tasks[index];
  task.done = !task.done;
  task.doneAt = task.done ? new Date().toISOString() : null;

  if (task.done && task.repeat && task.deadline) {
    const oldDate = new Date(task.deadline);
    let newDate;
    if (task.repeat === "daily") {
      newDate = new Date(oldDate.setDate(oldDate.getDate() + 1));
    } else if (task.repeat === "weekly") {
      newDate = new Date(oldDate.setDate(oldDate.getDate() + 7));
    }

    if (newDate) {
      tasks.push({
        ...task,
        deadline: newDate.toISOString().slice(0, 16),
        done: false,
        doneAt: null
      });
    }
  }

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

  const [datePart, timePart] = task.deadline?.split("T") || ["", ""];
  document.getElementById("task-deadline").value = datePart;
  document.getElementById("task-deadline-time").value = timePart || "";

  document.getElementById("task-priority").value = task.priority;
  document.getElementById("task-repeat").value = task.repeat || "";

  isEditing = true;
  editIndex = index;
  submitBtn.textContent = "Update task";
  cancelBtn.style.display = "inline-block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  isEditing = false;
  editIndex = null;
  submitBtn.textContent = "Add Task";
  taskForm.reset();
  cancelBtn.style.display = "none";
}

taskForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("task-name").value.trim();
  const category = document.getElementById("task-category").value.trim();
  const date = document.getElementById("task-deadline").value;
  const time = document.getElementById("task-deadline-time").value;
  const deadline = date && time ? `${date}T${time}` : date || "";
  const priority = document.getElementById("task-priority").value.trim().toLowerCase();
  const repeat = document.getElementById("task-repeat").value;

  if (!name) return;

  const newTask = {
    name,
    category,
    deadline,
    priority,
    repeat,
    done: false,
    doneAt: null
  };

  if (isEditing && editIndex !== null) {
    tasks[editIndex] = newTask;
    isEditing = false;
    editIndex = null;
    submitBtn.textContent = "Add Task";
    cancelBtn.style.display = "none";
  } else {
    tasks.push(newTask);
  }

  saveTasks();
  renderTasks();
  taskForm.reset();
});

cancelBtn.addEventListener("click", cancelEdit);
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
      `Repeat: ${task.repeat || "None"}`,
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

function exportTasksAsJson() {
  if (tasks.length === 0) {
    alert("No tasks to export!");
    return;
  }

  const jsonBlob = new Blob([JSON.stringify(tasks, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(jsonBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "homework_tasks.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importTasksFromJson(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");

      if (!confirm("Replace current tasks with imported ones?")) return;

      tasks = imported;
      saveTasks();
      renderTasks();
    } catch (err) {
      alert("Failed to import tasks: " + err.message);
    }
  };
  reader.readAsText(file);
}

exportBtn.addEventListener("click", exportTasks);
exportJsonBtn.addEventListener("click", exportTasksAsJson);
importJsonBtn.addEventListener("click", () => importJsonInput.click());
importJsonInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) importTasksFromJson(file);
});

document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
    e.preventDefault();
    searchInput.focus();
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
    e.preventDefault();
    document.getElementById("task-name").focus();
  }
});

fetch('messages.json')
  .then(response => response.json())
  .then(data => {
    noTasksMessages = data.noTasksMessages || [];
    renderTasks();
  })
  .catch(err => {
    console.warn("Could not load messages.json, using default message.");
    renderTasks();
  });
