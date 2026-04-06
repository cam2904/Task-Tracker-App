import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { format, isPast, isToday, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Square,
  X,
  ListTodo,
  Flag
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const badgeClass = {
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low"
  }[priority] || "badge-medium";

  return (
    <span data-testid={`priority-badge-${priority}`} className={badgeClass}>
      {priority}
    </span>
  );
};

// Task Form Component
const TaskForm = ({ onSubmit, initialData, onCancel, isEdit = false }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState(initialData?.priority || "medium");
  const [dueDate, setDueDate] = useState(
    initialData?.due_date ? parseISO(initialData.due_date) : null
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null
    });
    if (!isEdit) {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form" data-testid="task-form">
      <h2 className="font-heading text-2xl font-bold uppercase tracking-tight mb-6 text-[#0A0A0A]">
        {isEdit ? "Edit Task" : "Add New Task"}
      </h2>
      
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-bold uppercase tracking-widest mb-2 text-[#0A0A0A]">
            Task Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="brutal-input w-full"
            data-testid="task-title-input"
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-widest mb-2 text-[#0A0A0A]">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            rows={3}
            className="brutal-input w-full resize-none"
            data-testid="task-description-input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-2 text-[#0A0A0A]">
              Priority
            </label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger 
                className="brutal-input w-full h-auto border-4 border-[#0A0A0A]"
                data-testid="task-priority-select"
              >
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="border-4 border-[#0A0A0A] bg-white rounded-none shadow-[6px_6px_0px_0px_#0A0A0A]">
                <SelectItem value="high" className="font-bold cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-[#FF3B30]" strokeWidth={3} />
                    High
                  </span>
                </SelectItem>
                <SelectItem value="medium" className="font-bold cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-[#FFD93D]" strokeWidth={3} />
                    Medium
                  </span>
                </SelectItem>
                <SelectItem value="low" className="font-bold cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-[#4D96FF]" strokeWidth={3} />
                    Low
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-2 text-[#0A0A0A]">
              Due Date
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="brutal-input w-full flex items-center justify-between gap-2 text-left"
                  data-testid="task-due-date-picker"
                >
                  {dueDate ? format(dueDate, "MMM dd, yyyy") : "Select date"}
                  <CalendarIcon className="w-5 h-5" strokeWidth={3} />
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0 border-4 border-[#0A0A0A] bg-white rounded-none shadow-[6px_6px_0px_0px_#0A0A0A]"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                  className="rounded-none"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            className="brutal-btn-primary flex-1 flex items-center justify-center gap-2"
            data-testid={isEdit ? "update-task-btn" : "add-task-btn"}
          >
            {isEdit ? (
              <>
                <CheckSquare className="w-5 h-5" strokeWidth={3} />
                Update Task
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" strokeWidth={3} />
                Add Task
              </>
            )}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={onCancel}
              className="brutal-btn-icon px-6"
              data-testid="cancel-edit-btn"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

// Task Card Component
const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
  const isOverdue = task.due_date && !task.completed && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));
  const isDueToday = task.due_date && isToday(parseISO(task.due_date));

  return (
    <div 
      className={`task-card ${task.completed ? "task-completed" : ""}`}
      data-testid="task-card"
    >
      <div className="task-item-grid">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className="brutal-btn-icon"
          data-testid="mark-complete-checkbox"
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed ? (
            <CheckSquare className="w-6 h-6" strokeWidth={3} />
          ) : (
            <Square className="w-6 h-6" strokeWidth={3} />
          )}
        </button>

        {/* Task Content */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span 
              className={`task-title font-bold text-lg ${task.completed ? "" : "text-[#0A0A0A]"}`}
              data-testid="task-title"
            >
              {task.title}
            </span>
            <PriorityBadge priority={task.priority} />
          </div>
          
          {task.description && (
            <p className="text-sm text-[#4B5563]" data-testid="task-description">
              {task.description}
            </p>
          )}
          
          {task.due_date && (
            <span 
              className={`due-date flex items-center gap-1 ${isOverdue ? "overdue" : ""} ${isDueToday ? "text-[#FFD93D] font-bold" : ""}`}
              data-testid="task-due-date"
            >
              <CalendarIcon className="w-4 h-4" strokeWidth={3} />
              {isDueToday ? "Due Today" : format(parseISO(task.due_date), "MMM dd, yyyy")}
              {isOverdue && " (Overdue)"}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="brutal-btn-icon"
            data-testid="edit-task-btn"
            aria-label="Edit task"
          >
            <Pencil className="w-5 h-5" strokeWidth={3} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="brutal-btn-icon hover:bg-[#FF3B30] hover:text-white"
            data-testid="delete-task-btn"
            aria-label="Delete task"
          >
            <Trash2 className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ filter }) => (
  <div className="empty-state brutal-card" data-testid="empty-state">
    <ListTodo className="empty-state-icon" strokeWidth={2} />
    <h3 className="empty-state-title">
      {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
    </h3>
    <p className="empty-state-text">
      {filter === "all" 
        ? "Add your first task above to get started!" 
        : `You don't have any ${filter === "completed" ? "completed" : "active"} tasks.`}
    </p>
  </div>
);

// Stats Component
const Stats = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter(t => t.priority === "high" && !t.completed).length;

  return (
    <div className="stats-grid" data-testid="stats-grid">
      <div className="stat-card">
        <div className="stat-number" data-testid="stat-total">{total}</div>
        <div className="stat-label">Total</div>
      </div>
      <div className="stat-card">
        <div className="stat-number text-[#4D96FF]" data-testid="stat-pending">{pending}</div>
        <div className="stat-label">Pending</div>
      </div>
      <div className="stat-card">
        <div className="stat-number text-green-600" data-testid="stat-completed">{completed}</div>
        <div className="stat-label">Done</div>
      </div>
      <div className="stat-card">
        <div className="stat-number text-[#FF3B30]" data-testid="stat-high-priority">{highPriority}</div>
        <div className="stat-label">Urgent</div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (filter === "completed") params.completed = true;
      if (filter === "active") params.completed = false;
      
      const response = await axios.get(`${API}/todos`, { params });
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create task
  const handleCreateTask = async (taskData) => {
    try {
      const response = await axios.post(`${API}/todos`, taskData);
      setTasks(prev => [response.data, ...prev]);
      toast.success("Task created successfully!");
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
  };

  // Update task
  const handleUpdateTask = async (taskData) => {
    if (!editingTask) return;
    try {
      const response = await axios.put(`${API}/todos/${editingTask.id}`, taskData);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? response.data : t));
      setEditingTask(null);
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  // Toggle task completion
  const handleToggleTask = async (task) => {
    try {
      const response = await axios.put(`${API}/todos/${task.id}`, {
        completed: !task.completed
      });
      setTasks(prev => prev.map(t => t.id === task.id ? response.data : t));
      toast.success(response.data.completed ? "Task completed!" : "Task reopened");
    } catch (error) {
      console.error("Failed to toggle task:", error);
      toast.error("Failed to update task");
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/todos/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Task deleted");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Filter tasks for display
  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "active") return !task.completed;
    return true;
  });

  return (
    <div className="app-container dot-grid-bg p-4 sm:p-8 lg:p-16" data-testid="todo-app">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            border: '4px solid #0A0A0A',
            borderRadius: '0',
            boxShadow: '4px 4px 0px 0px #0A0A0A',
            fontWeight: 'bold'
          }
        }}
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="app-header" data-testid="app-header">
          <div>
            <h1 className="app-title">Task Tracker</h1>
            <p className="text-[#4B5563] font-medium mt-2">
              Get things done, one task at a time.
            </p>
          </div>
        </header>

        {/* Stats */}
        <div className="mb-8">
          <Stats tasks={tasks} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Task Form */}
          <div className="lg:col-span-5">
            {editingTask ? (
              <TaskForm
                key={editingTask.id}
                initialData={editingTask}
                onSubmit={handleUpdateTask}
                onCancel={() => setEditingTask(null)}
                isEdit
              />
            ) : (
              <TaskForm onSubmit={handleCreateTask} />
            )}
          </div>

          {/* Main - Task List */}
          <div className="lg:col-span-7">
            {/* Filter Tabs */}
            <div className="filter-pills mb-6" data-testid="filter-tabs">
              {["all", "active", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-pill ${filter === f ? "active" : "bg-white"}`}
                  data-testid={`filter-${f}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Task List */}
            {loading ? (
              <div className="brutal-card text-center py-8">
                <p className="font-bold text-[#4B5563]">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              <div className="task-list" data-testid="task-list">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


