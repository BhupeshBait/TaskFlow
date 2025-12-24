const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Task API
export const taskAPI = {
  async getTasks(
    page = 1,
    limit = 50,
    listId?: number,
    priority?: string,
    search?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (listId) params.append('list_id', listId.toString());
    if (priority) params.append('priority', priority);
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/tasks?${params}`);
    return handleResponse(response);
  },

  async createTask(data: {
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    list_id: number;
    tags?: Array<{ name: string; color: string }>;
  }) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateTask(
    id: number,
    data: {
      title?: string;
      description?: string;
      priority?: string;
      due_date?: string;
      completed?: boolean;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteTask(id: number) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  async bulkComplete(ids: number[]) {
    const response = await fetch(`${API_BASE_URL}/tasks/bulk-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    return handleResponse(response);
  },

  async getTemplates() {
    const response = await fetch(`${API_BASE_URL}/tasks/templates`);
    return handleResponse(response);
  },
};

// List API
export const listAPI = {
  async getLists() {
    const response = await fetch(`${API_BASE_URL}/lists`);
    return handleResponse(response);
  },

  async createList(data: { name: string; color: string }) {
    const response = await fetch(`${API_BASE_URL}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateList(id: number, data: { name?: string; color?: string }) {
    const response = await fetch(`${API_BASE_URL}/lists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteList(id: number) {
    const response = await fetch(`${API_BASE_URL}/lists/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// Stats API
export const statsAPI = {
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return handleResponse(response);
  },

  async resetStreak() {
    const response = await fetch(`${API_BASE_URL}/stats/reset-streak`, {
      method: 'POST',
    });
    return handleResponse(response);
  },
};

// Health API
export const healthAPI = {
  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
};
