import { API_BASE_URL } from "../config";

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }

  return res.json();
}

export async function getComplaints() {
  return apiFetch<any[]>("/admin/complaints");
}

export async function getWorkOrders() {
  return apiFetch<any[]>("/admin/work-orders");
}

export async function getAnalytics() {
  return apiFetch<any>("/admin/analytics");
}

export async function generateWorkOrder(complaintId: string) {
  return apiFetch<any>(`/admin/generate-work-order/${complaintId}`, {
    method: "POST",
  });
}

export async function completeWorkOrder(workOrderId: string) {
  return apiFetch<any>(`/crew/complete-work-order/${workOrderId}`, {
    method: "POST",
  });
}
