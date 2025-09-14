export function loadTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

export function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

export function exportAsText(tasks) {
  if (!tasks.length) return alert("No tasks to export!");
  const content = tasks.map(task => [
    `Task: ${task.name}`,
    `Category: ${task.category || "None"}`,
    `Deadline: ${task.deadline || "None"}`,
    `Priority: ${task.priority || "None"}`,
    `Status: ${task.done ? "Done" : "Not done"}`,
    "--------------------------"
  ].join("\n")).join("\n\n");

  const blob = new Blob([content], { type: "text/plain" });
  downloadBlob(blob, "homework_tasks.txt");
}

export function exportAsJson(tasks) {
  if (!tasks.length) return alert("No tasks to export!");
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  downloadBlob(blob, "homework_tasks.json");
}

export function importFromJson(file, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      const cleaned = imported.map(t => { delete t.repeat; return t; });
      callback(cleaned);
    } catch (err) {
      alert("Failed to import tasks: " + err.message);
    }
  };
  reader.readAsText(file);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
