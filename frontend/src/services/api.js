const API_BASE = '/api/v1';

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchProjects(params = {}) {
  const query = new URLSearchParams();
  if (params.sector) query.set('sector', params.sector);
  if (params.ministry) query.set('ministry', params.ministry);
  if (params.state) query.set('state', params.state);
  if (params.risk_level) query.set('risk_level', params.risk_level);
  if (params.search) query.set('search', params.search);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.order) query.set('order', params.order);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset) query.set('offset', String(params.offset));

  const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function fetchPriorityQueue(limit = 25, sector, ministry, risk_level) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (sector) query.set('sector', sector);
  if (ministry) query.set('ministry', ministry);
  if (risk_level) query.set('risk_level', risk_level);

  const res = await fetch(`${API_BASE}/risk/priority-queue?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch priority queue');
  return res.json();
}

export async function fetchProjectDetail(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`);
  if (!res.ok) throw new Error(`Failed to fetch project ${projectId}`);
  return res.json();
}

export async function fetchProjectTrajectory(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/trajectory`);
  if (!res.ok) throw new Error(`Failed to fetch trajectory for ${projectId}`);
  return res.json();
}

export async function fetchProjectExplanation(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/explanation`);
  if (!res.ok) throw new Error(`Failed to fetch explanation for ${projectId}`);
  return res.json();
}

export async function fetchProjectRecommendations(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/recommendations`);
  if (!res.ok) throw new Error(`Failed to fetch recommendations for ${projectId}`);
  return res.json();
}

export async function fetchAlerts(severity, limit = 50) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (severity) query.set('severity', severity);
  const res = await fetch(`${API_BASE}/alerts?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchBenchmarks(sector) {
  const query = new URLSearchParams();
  if (sector) query.set('sector', sector);
  const res = await fetch(`${API_BASE}/benchmarks?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch benchmarks');
  return res.json();
}

export async function fetchModelHealth() {
  const res = await fetch(`${API_BASE}/model/health`);
  if (!res.ok) throw new Error('Failed to fetch model health');
  return res.json();
}

export async function fetchDataQualityReport() {
  const res = await fetch(`${API_BASE}/data-quality`);
  if (!res.ok) throw new Error('Failed to fetch data quality report');
  return res.json();
}

export async function recordIntervention(data) {
  const res = await fetch(`${API_BASE}/interventions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to record intervention');
  return res.json();
}

export async function fetchInterventions(projectId) {
  const query = new URLSearchParams();
  if (projectId) query.set('project_id', projectId);
  const res = await fetch(`${API_BASE}/interventions?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch interventions');
  return res.json();
}

