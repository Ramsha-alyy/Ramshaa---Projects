// Global Variables
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;
let currentDetailTaskId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    renderTasks();
    updateTaskCounts();
});

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('modernTodoTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('modernTodoTasks', JSON.stringify(tasks));
}

// Open Task Modal
function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveBtn');
    
    // Reset form
    form.reset();
    
    if (taskId) {
        // Edit mode
        editingTaskId = taskId;
        const task = tasks.find(t => t.id === taskId);
        
        modalTitle.textContent = 'Edit Task';
        saveBtn.textContent = 'Update Task';
        
        // Populate form
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate || '';
    } else {
        // Add mode
        editingTaskId = null;
        modalTitle.textContent = 'Add New Task';
        saveBtn.textContent = 'Save Task';
    }
    
    modal.classList.add('show');
    document.getElementById('taskTitle').focus();
}

// Close Task Modal
function closeTaskModal(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('taskModal');
    modal.classList.remove('show');
    editingTaskId = null;
    
    // Reset form
    document.getElementById('taskForm').reset();
}

// Save Task
function saveTask(event) {
    event.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    const taskData = {
        title,
        description,
        category,
        priority,
        dueDate,
        updatedAt: new Date().toISOString()
    };
    
    if (editingTaskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
        }
    } else {
        // Create new task
        const newTask = {
            id: Date.now(),
            ...taskData,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.unshift(newTask);
    }
    
    saveTasks();
    renderTasks();
    updateTaskCounts();
    closeTaskModal();
}

// Toggle Task Completion
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        saveTasks();
        renderTasks();
        updateTaskCounts();
    }
}

// Delete Task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateTaskCounts();
    }
}

// Filter Tasks
function filterTasks(filter, btnElement) {
    currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    
    renderTasks();
}

// Search Tasks
function searchTasks() {
    renderTasks();
}

// Get Filtered Tasks
function getFilteredTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = tasks;
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply status filter
    switch (currentFilter) {
        case 'pending':
            filtered = filtered.filter(task => !task.completed);
            break;
        case 'completed':
            filtered = filtered.filter(task => task.completed);
            break;
        default:
            // 'all' - no additional filtering
            break;
    }
    
    return filtered;
}

// Render Tasks
function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const emptyState = document.getElementById('emptyState');
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-header">
                <div class="task-main">
                    <div class="task-title ${task.completed ? 'completed' : ''}" 
                         onclick="openTaskDetail(${task.id})">
                        ${task.title}
                    </div>
                    ${task.description ? `
                        <div class="task-description">
                            ${task.description.length > 100 ? 
                                task.description.substring(0, 100) + '...' : 
                                task.description}
                        </div>
                    ` : ''}
                    <div class="task-meta">
                        <span class="task-category">${getCategoryIcon(task.category)} ${formatCategory(task.category)}</span>
                        <span class="task-priority ${task.priority}">${getPriorityIcon(task.priority)} ${formatPriority(task.priority)}</span>
                        ${task.dueDate ? `
                            <span class="task-due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}">
                                📅 ${formatDate(task.dueDate)}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <div class="task-checkbox ${task.completed ? 'completed' : ''}" 
                         onclick="toggleTask(${task.id})">
                        ${task.completed ? '✓' : ''}
                    </div>
                    <button class="action-btn" onclick="openTaskModal(${task.id})" title="Edit Task">
                        ✏️
                    </button>
                    <button class="action-btn delete" onclick="deleteTask(${task.id})" title="Delete Task">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Open Task Detail Modal
function openTaskDetail(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    currentDetailTaskId = taskId;
    
    // Populate detail modal
    document.getElementById('detailTitle').textContent = task.title;
    document.getElementById('detailDescription').textContent = task.description || 'No description provided';
    document.getElementById('detailCategory').textContent = `${getCategoryIcon(task.category)} ${formatCategory(task.category)}`;
    document.getElementById('detailPriority').textContent = `${getPriorityIcon(task.priority)} ${formatPriority(task.priority)}`;
    document.getElementById('detailDueDate').textContent = task.dueDate ? formatDate(task.dueDate) : 'Not set';
    document.getElementById('detailCreated').textContent = formatDateTime(task.createdAt);
    
    // Show modal
    document.getElementById('taskDetailModal').classList.add('show');
}

// Close Task Detail Modal
function closeDetailModal(event) {
    if (event && event.target !== event.currentTarget) return;
    
    document.getElementById('taskDetailModal').classList.remove('show');
    currentDetailTaskId = null;
}

// Edit Task from Detail Modal
function editTaskFromDetail() {
    if (currentDetailTaskId) {
        closeDetailModal();
        openTaskModal(currentDetailTaskId);
    }
}

// Update Task Counts
function updateTaskCounts() {
    const allCount = tasks.length;
    const pendingCount = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;
    
    document.getElementById('allCount').textContent = allCount;
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('completedCount').textContent = completedCount;
}

// Utility Functions
function getCategoryIcon(category) {
    const icons = {
        personal: '📋',
        work: '💼',
        shopping: '🛒',
        health: '🏥',
        study: '📚'
    };
    return icons[category] || '📋';
}

function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function getPriorityIcon(priority) {
    const icons = {
        low: '🟢',
        medium: '🟡',
        high: '🔴'
    };
    return icons[priority] || '🟡';
}

function formatPriority(priority) {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function isOverdue(dateString) {
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to close modals
    if (event.key === 'Escape') {
        closeTaskModal();
        closeDetailModal();
    }
    
    // Ctrl/Cmd + N to add new task
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        openTaskModal();
    }
    
    // Ctrl/Cmd + F to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

// Auto-save draft (optional feature)
let draftTimeout;
function saveDraft() {
    clearTimeout(draftTimeout);
    draftTimeout = setTimeout(() => {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        
        if (title || description) {
            localStorage.setItem('taskDraft', JSON.stringify({
                title,
                description,
                category: document.getElementById('taskCategory').value,
                priority: document.getElementById('taskPriority').value,
                dueDate: document.getElementById('taskDueDate').value
            }));
        }
    }, 1000);
}

// Load draft when opening modal
function loadDraft() {
    const draft = localStorage.getItem('taskDraft');
    if (draft && !editingTaskId) {
        const draftData = JSON.parse(draft);
        if (draftData.title || draftData.description) {
            if (confirm('You have an unsaved draft. Would you like to restore it?')) {
                document.getElementById('taskTitle').value = draftData.title || '';
                document.getElementById('taskDescription').value = draftData.description || '';
                document.getElementById('taskCategory').value = draftData.category || 'personal';
                document.getElementById('taskPriority').value = draftData.priority || 'medium';
                document.getElementById('taskDueDate').value = draftData.dueDate || '';
            }
        }
    }
}

// Clear draft when task is saved
function clearDraft() {
    localStorage.removeItem('taskDraft');
}

// Add event listeners for draft saving
document.addEventListener('DOMContentLoaded', function() {
    const formInputs = ['taskTitle', 'taskDescription', 'taskCategory', 'taskPriority', 'taskDueDate'];
    
    formInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', saveDraft);
            element.addEventListener('change', saveDraft);
        }
    });
});

// Enhance the openTaskModal function to load draft
const originalOpenTaskModal = openTaskModal;
openTaskModal = function(taskId = null) {
    originalOpenTaskModal(taskId);
    if (!taskId) {
        setTimeout(loadDraft, 100);
    }
};

// Enhance the saveTask function to clear draft
const originalSaveTask = saveTask;
saveTask = function(event) {
    originalSaveTask(event);
    clearDraft();
};