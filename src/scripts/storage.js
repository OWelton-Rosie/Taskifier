export function loadTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

export function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
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
