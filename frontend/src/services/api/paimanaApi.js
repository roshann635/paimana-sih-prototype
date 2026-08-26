/**
 * PAIMANA API Service Layer (src/services/api/paimanaApi.js)
 * Provides centralized data fetching methods with automatic fallback to mock cache.
 */

import {
  mockDashboardSummary,
  mockModelHealth,
  mockDataQuality,
} from "../../data/mock/mockData";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(
      `[API] Fetch failed for ${endpoint}, using fallback if available:`,
      err.message,
    );
    throw err;
  }
}

export const paimanaApi = {
  // 1. Dashboard Summary
  async getDashboardSummary() {
    try {
      return await fetchJson("/dashboard/summary");
    } catch {
      return mockDashboardSummary;
    }
  },

  // 2. Project List & Priority Queue
  async getProjects(params = {}) {
    const query = new URLSearchParams();
    if (params.sector) query.set("sector", params.sector);
    if (params.ministry) query.set("ministry", params.ministry);
    if (params.state) query.set("state", params.state);
    if (params.risk_level) query.set("risk_level", params.risk_level);
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.order) query.set("order", params.order);
    if (params.limit) query.set("limit", params.limit);
    if (params.offset) query.set("offset", params.offset);

    const qs = query.toString();
    return await fetchJson(`/projects${qs ? `?${qs}` : ""}`);
  },

  async getPriorityQueue(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", params.limit);
    if (params.sector) query.set("sector", params.sector);
    if (params.ministry) query.set("ministry", params.ministry);
    if (params.risk_level) query.set("risk_level", params.risk_level);

    const qs = query.toString();
    return await fetchJson(`/risk/priority-queue${qs ? `?${qs}` : ""}`);
  },

  // 3. Project Detail & Trajectory
  async getProjectById(projectId) {
    return await fetchJson(`/projects/${projectId}`);
  },

  async getProjectTrajectory(projectId) {
    return await fetchJson(`/projects/${projectId}/trajectory`);
  },

  // 4. Intelligence: SHAP Explanation & Directives
  async getProjectExplanation(projectId) {
    return await fetchJson(`/projects/${projectId}/explanation`);
  },

  async getProjectRecommendations(projectId) {
    return await fetchJson(`/projects/${projectId}/recommendations`);
  },

  // 5. Early Warning Alerts
  async getAlerts(params = {}) {
    const query = new URLSearchParams();
    if (params.severity) query.set("severity", params.severity);
    if (params.limit) query.set("limit", params.limit || 50);

    const qs = query.toString();
    return await fetchJson(`/alerts${qs ? `?${qs}` : ""}`);
  },

  // 6. Benchmarks
  async getBenchmarks(params = {}) {
    const query = new URLSearchParams();
    if (params.sector) query.set("sector", params.sector);

    const qs = query.toString();
    return await fetchJson(`/benchmarks${qs ? `?${qs}` : ""}`);
  },

  // 7. Model Health
  async getModelHealth() {
    try {
      return await fetchJson("/model/health");
    } catch {
      return mockModelHealth;
    }
  },

  // 8. Data Quality Engine
  async getDataQuality() {
    try {
      return await fetchJson("/data-quality");
    } catch {
      return mockDataQuality;
    }
  },

  // 9. Interventions
  async getInterventions(projectId = null) {
    const query = projectId ? `?project_id=${projectId}` : "";
    return await fetchJson(`/interventions${query}`);
  },

  async createIntervention(data) {
    return await fetchJson("/interventions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
