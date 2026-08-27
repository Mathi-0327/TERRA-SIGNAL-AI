const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_API_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API Error [${res.status}]: ${errText || res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Failed request to ${url}:`, error);
    throw error;
  }
}

export const ApiClient = {
  // Dashboard
  getDashboard: () => fetchJson<any>('/dashboard/'),
  getDashboardOverview: () => fetchJson<any>('/dashboard/'),

  // Locations
  getLocations: () => fetchJson<any[]>('/locations/'),
  getLocationProfile: (id: number) => fetchJson<any>(`/locations/${id}`),
  compareLocations: (locationIds: number[]) =>
    fetchJson<any>('/locations/compare', {
      method: 'POST',
      body: JSON.stringify({ location_ids: locationIds })
    }),

  // Properties
  analyzeProperty: (payload: any) =>
    fetchJson<any>('/properties/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  evaluateProperty: (payload: any) =>
    fetchJson<any>('/properties/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getProperties: (locationId?: number) =>
    fetchJson<any>(`/properties/${locationId ? `?location_id=${locationId}` : ''}`),

  // Early Warning Alerts
  getAlerts: (severity?: string) =>
    fetchJson<any[]>(`/alerts/${severity ? `?severity=${severity}` : ''}`),
  triggerAnomalyScan: () =>
    fetchJson<any>('/alerts/scan', { method: 'POST' }),

  // Opportunity Radar
  getOpportunities: () => fetchJson<any[]>('/opportunities/'),

  // Market Intelligence
  getMarketHistory: (locationId: number) => fetchJson<any>(`/market/history/${locationId}`),
  getMetroTrends: () => fetchJson<any[]>('/market/metro-trends'),

  // What-If Scenario Simulation
  runScenario: (payload: any) =>
    fetchJson<any>('/simulate/', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Grounded AI Analyst
  queryAIAnalyst: (payload: { question: string; location_id?: number; property_context?: any; scenario_context?: any }) =>
    fetchJson<any>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Portfolio
  getPortfolio: () => fetchJson<any>('/portfolio/'),
  addPortfolioItem: (payload: any) =>
    fetchJson<any>('/portfolio/', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Reports
  generateReport: (payload: any) =>
    fetchJson<any>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getReport: (id: number) => fetchJson<any>(`/reports/${id}`),
  getReportsList: () => fetchJson<any[]>('/reports/'),

  // Admin & Governance
  getAdminOverview: () => fetchJson<any>('/admin/overview'),
  triggerRetraining: () => fetchJson<any>('/admin/retrain', { method: 'POST' })
};
