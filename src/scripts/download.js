// Core download helper
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // Export tasks as plain text
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
  
  // Export tasks as JSON
  export function exportAsJson(tasks) {
    if (!tasks.length) return alert("No tasks to export!");
  
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
    downloadBlob(blob, "homework_tasks.json");
  }
  