export const priorityMap = { high: 1, medium: 2, low: 3 };

export function formatTimeDifference(diffMs) {
  const absMs = Math.abs(diffMs);
  const minutes = Math.floor(absMs / (1000 * 60));
  const hours = Math.floor(absMs / (1000 * 60 * 60));
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  return `${days} day${days === 1 ? '' : 's'}`;
}

export function toggleDone(task, tasks) {
  task.done = !task.done;
  task.doneAt = task.done ? new Date().toISOString() : null;

  if (task.done && task.repeat && task.deadline) {
    const oldDate = new Date(task.deadline);
    let newDate;
    if (task.repeat === "daily") newDate = new Date(oldDate.setDate(oldDate.getDate() + 1));
    if (task.repeat === "weekly") newDate = new Date(oldDate.setDate(oldDate.getDate() + 7));

    if (newDate) {
      tasks.push({
        ...task,
        deadline: newDate.toISOString().slice(0, 16),
        done: false,
        doneAt: null
      });
    }
  }
}
