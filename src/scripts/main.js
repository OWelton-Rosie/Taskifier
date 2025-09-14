import { loadTasks, saveTasks, exportAsText, exportAsJson, importFromJson } from "./storage.js";
import { toggleDone } from "./tasks.js";
import { renderTasks } from "./ui.js";

let tasks = loadTasks().map(t => { delete t.repeat; return t; });
let noTasksMessages = ["🎉 No tasks left!"];
let isEditing = false;
let editIndex = null;

const taskForm = document.getElementById("task-form");
const submitBtn = taskForm.querySelector("button[type='submit']");
const cancelBtn = document.getElementById("cancel-edit");

const elements = {
  taskList: document.getElementById("task-list"),
  searchInput: document.getElementById("search"),
  filterCategory: document.getElementById("filter-category"),
  sortBySelect: document.getElementById("sort-by"),
  noTasksMessageBox: document.getElementById("no-tasks-message"),
  endOfListMessage: document.getElementById("end-of-list-message"),
};

// -----------------
// Callbacks for renderTasks
// -----------------
const callbacks = {
  onToggleDone: (task, index) => {
    toggleDone(task, tasks);
    saveTasks(tasks);
    renderTasks(tasks, elements, noTasksMessages, callbacks);
  },
  onEdit: (task, index) => {
    document.getElementById("task-name").value = task.name;
    document.getElementById("task-category").value = task.category;
    const [datePart, timePart] = task.deadline?.split("T") || ["", ""];
    document.getElementById("task-deadline").value = datePart;
    document.getElementById("task-deadline-time").value = timePart || "";
    document.getElementById("task-priority").value = task.priority || "";

    isEditing = true;
    editIndex = index;
    submitBtn.textContent = "Update Task";
    cancelBtn.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  onDelete: (task, index) => {
    if (confirm("Delete this task?")) {
      tasks.splice(index, 1);
      saveTasks(tasks);
      renderTasks(tasks, elements, noTasksMessages, callbacks);
    }
  }
};

// -----------------
// Form submit
// -----------------
taskForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("task-name").value.trim();
  if (!name) return;

  const category = document.getElementById("task-category").value.trim();
  const date = document.getElementById("task-deadline").value;
  const time = document.getElementById("task-deadline-time").value;
  const deadline = date && time ? `${date}T${time}` : date || "";
  const priority = document.getElementById("task-priority").value.trim().toLowerCase();

  if (isEditing && editIndex !== null) {
    const task = tasks[editIndex];
    task.name = name;
    task.category = category;
    task.deadline = deadline;
    task.priority = priority;

    isEditing = false;
    editIndex = null;
    submitBtn.textContent = "Add Task";
    cancelBtn.style.display = "none";
  } else {
    const newTask = { name, category, deadline, priority, done: false, doneAt: null };
    tasks.push(newTask);
  }

  saveTasks(tasks);
  renderTasks(tasks, elements, noTasksMessages, callbacks);
  taskForm.reset();
});

// -----------------
// Cancel editing
// -----------------
cancelBtn.addEventListener("click", () => {
  isEditing = false;
  editIndex = null;
  submitBtn.textContent = "Add Task";
  taskForm.reset();
  cancelBtn.style.display = "none";
});

// -----------------
// Filters & search
// -----------------
elements.searchInput.addEventListener("input", () => renderTasks(tasks, elements, noTasksMessages, callbacks));
elements.filterCategory.addEventListener("change", () => renderTasks(tasks, elements, noTasksMessages, callbacks));
elements.sortBySelect.addEventListener("change", () => renderTasks(tasks, elements, noTasksMessages, callbacks));

// -----------------
// Export / import
// -----------------
document.getElementById("export-tasks").addEventListener("click", () => exportAsText(tasks));
document.getElementById("export-json").addEventListener("click", () => exportAsJson(tasks));
document.getElementById("import-json-btn").addEventListener("click", () =>
  document.getElementById("import-json").click()
);
document.getElementById("import-json").addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    importFromJson(file, imported => {
      if (confirm("Replace current tasks with imported ones?")) {
        tasks = imported.map(t => { delete t.repeat; return t; });
        saveTasks(tasks);
        renderTasks(tasks, elements, noTasksMessages, callbacks);
      }
    });
  }
});

// -----------------
// Keyboard shortcuts
// -----------------
document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
    e.preventDefault();
    elements.searchInput.focus();
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
    e.preventDefault();
    document.getElementById("task-name").focus();
  }
});

// -----------------
// Load noTasksMessages from messages.json (async, doesn't block render)
// -----------------
fetch("./messages.json")
  .then(res => res.json())
  .then(data => {
    if (data.noTasksMessages && Array.isArray(data.noTasksMessages)) {
      noTasksMessages = data.noTasksMessages;
      renderTasks(tasks, elements, noTasksMessages, callbacks);
    }
  })
  .catch(err => console.error("Failed to load messages.json", err));

// -----------------
// Initial render
// -----------------
renderTasks(tasks, elements, noTasksMessages, callbacks);
