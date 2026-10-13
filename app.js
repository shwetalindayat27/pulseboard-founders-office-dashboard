const seedTasks = [
  { id: 1, title: "Review weekly business metrics", priority: "High", status: "In progress" },
  { id: 2, title: "Prepare notes for team check-in", priority: "Medium", status: "To do" },
  { id: 3, title: "Document customer feedback themes", priority: "High", status: "To do" },
  { id: 4, title: "Share sprint update with stakeholders", priority: "Low", status: "Completed" }
];

let tasks;
try {
  const saved = localStorage.getItem("pulseboard-tasks");
  tasks = saved ? JSON.parse(saved) : seedTasks;
  if (!Array.isArray(tasks)) tasks = seedTasks;
} catch {
  tasks = seedTasks;
}

const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const filter = document.getElementById("status-filter");
const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const priorityInput = document.getElementById("task-priority");

document.getElementById("today-date").textContent = new Intl.DateTimeFormat("en-IN", {
  day: "numeric", month: "short", year: "numeric"
}).format(new Date());

function saveTasks() {
  localStorage.setItem("pulseboard-tasks", JSON.stringify(tasks));
}

function updateMetrics() {
  document.getElementById("total-count").textContent = tasks.length;
  document.getElementById("completed-count").textContent = tasks.filter(t => t.status === "Completed").length;
  document.getElementById("progress-count").textContent = tasks.filter(t => t.status === "In progress").length;
  document.getElementById("priority-count").textContent = tasks.filter(t => t.priority === "High" && t.status !== "Completed").length;
}

function renderTasks() {
  taskList.replaceChildren();
  const visibleTasks = tasks.filter(task => filter.value === "all" || task.status === filter.value);
  emptyState.hidden = visibleTasks.length !== 0;

  visibleTasks.forEach(task => {
    const row = document.createElement("div");
    row.className = `task-row ${task.status === "Completed" ? "completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.status === "Completed";
    checkbox.setAttribute("aria-label", `Mark ${task.title} completed`);
    checkbox.addEventListener("change", () => {
      task.status = checkbox.checked ? "Completed" : "To do";
      saveTasks(); renderTasks(); updateMetrics();
    });

    const main = document.createElement("div");
    main.className = "task-main";
    const title = document.createElement("strong");
    title.textContent = task.title;
    const meta = document.createElement("small");
    meta.textContent = `Task #${task.id}`;
    main.append(title, meta);

    const badge = document.createElement("span");
    badge.className = `badge ${task.priority}`;
    badge.textContent = task.priority;

    const status = document.createElement("select");
    status.className = "task-status";
    status.setAttribute("aria-label", `Status for ${task.title}`);
    ["To do", "In progress", "Completed"].forEach(value => {
      const option = document.createElement("option");
      option.value = value; option.textContent = value;
      status.append(option);
    });
    status.value = task.status;
    status.addEventListener("change", () => {
      task.status = status.value;
      saveTasks(); renderTasks(); updateMetrics();
    });

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${task.title}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks(); renderTasks(); updateMetrics();
    });

    row.append(checkbox, main, badge, status, remove);
    taskList.append(row);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) { titleInput.focus(); return; }
  tasks.unshift({
    id: Date.now(),
    title,
    priority: priorityInput.value,
    status: "To do"
  });
  saveTasks();
  titleInput.value = "";
  priorityInput.value = "Medium";
  renderTasks();
  updateMetrics();
});

filter.addEventListener("change", renderTasks);
document.getElementById("add-task-top").addEventListener("click", () => {
  titleInput.focus();
  document.getElementById("tasks").scrollIntoView({ behavior: "smooth", block: "start" });
});

renderTasks();
updateMetrics();
