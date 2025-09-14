import { formatTimeDifference, priorityMap } from "./tasks.js";

export function applyMessageStyle(el, text) {
  el.style.textAlign = "center";
  el.style.fontStyle = "italic";
  el.style.color = "#555";
  el.textContent = text;
}

export function clearMessage(el) {
  el.textContent = "";
  el.removeAttribute("style");
}

export function updateCategoryFilter(filterCategory, categories) {
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

  if (categories.has(currentValue)) filterCategory.value = currentValue;
}

export function renderTasks(tasks, elements, noTasksMessages, callbacks) {
  const { taskList, searchInput, filterCategory, sortBySelect, noTasksMessageBox, endOfListMessage } = elements;

  taskList.innerHTML = "";
  clearMessage(noTasksMessageBox);
  clearMessage(endOfListMessage);

  const categories = new Set(tasks.map(t => t.category).filter(Boolean));
  updateCategoryFilter(filterCategory, categories);

  const search = searchInput.value.toLowerCase();
  const categoryFilterValue = filterCategory.value;
  const sortOption = sortBySelect.value;

  let sortedTasks = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const prioA = priorityMap[a.priority?.toLowerCase()] || 99;
    const prioB = priorityMap[b.priority?.toLowerCase()] || 99;

    switch (sortOption) {
      case "priority-asc": return prioA - prioB;
      case "priority-desc": return prioB - prioA;
      case "name-asc": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      default: return 0;
    }
  });

  let visibleCount = 0;

  sortedTasks.forEach((task, index) => {
    const taskCategory = task.category || "";
    const matchesSearch = task.name.toLowerCase().includes(search) || taskCategory.toLowerCase().includes(search);
    const matchesCategory = !categoryFilterValue || taskCategory === categoryFilterValue;

    if (matchesSearch && matchesCategory) {
      visibleCount++;

      const li = document.createElement("li");
      li.classList.add(`priority-${task.priority?.toLowerCase() || "none"}`);
      if (task.done) li.classList.add("done");

      let deadlineText = "No deadline";
      if (task.deadline) {
        const dateObj = new Date(task.deadline);
        const now = new Date();
        const diff = dateObj - now;
        const formattedDiff = formatTimeDifference(diff);
        const timePart = dateObj.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

        if (task.done) {
          deadlineText = diff < 0
            ? `${timePart} (was due ${formattedDiff} ago)`
            : `${timePart} (was due in ${formattedDiff})`;
        } else {
          deadlineText = diff > 0
            ? `${timePart} (due in ${formattedDiff})`
            : `${timePart} (${formattedDiff} overdue)`;
        }
      }

      li.innerHTML = `
        <div class="task-header">
          <strong>${task.name}</strong>
          <span class="category-tag">${taskCategory || "No category"}</span>
        </div>
        <div class="task-meta">
          <span class="deadline">Due: ${deadlineText}</span>
          <br>
          <span class="priority">Priority: ${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "None"}</span>
          ${task.done && task.doneAt ? `<span class="done-at">✅ Completed: ${new Date(task.doneAt).toLocaleString()}</span>` : ""}
        </div>
        <div class="task-actions">
          <button class="toggle-done">${task.done ? "Mark as incomplete" : "Mark as completed"}</button>
          <button class="edit-task">Edit task</button>
          <button class="delete-task">Delete task</button>
        </div>
      `;

      taskList.appendChild(li);
      li.querySelector(".toggle-done").addEventListener("click", () => callbacks.onToggleDone(task, index));
      li.querySelector(".edit-task").addEventListener("click", () => callbacks.onEdit(task, index));
      li.querySelector(".delete-task").addEventListener("click", () => callbacks.onDelete(task, index));
    }
  });

  if (tasks.length === 0) {
    const msg = noTasksMessages[Math.floor(Math.random() * noTasksMessages.length)] || "🎉 No tasks yet!";
    applyMessageStyle(noTasksMessageBox, msg);
  } else if (visibleCount === 0) {
    const msg = search ? `No tasks found for "${search}"` : "No tasks match your filter";
    applyMessageStyle(noTasksMessageBox, msg);
  } else if (tasks.every(t => t.done)) {
    const msg = noTasksMessages[Math.floor(Math.random() * noTasksMessages.length)] || "🎉 All tasks complete! Great job!";
    applyMessageStyle(noTasksMessageBox, msg);
  }

  applyMessageStyle(endOfListMessage, "📦 Looks like you've reached the end.");
}
