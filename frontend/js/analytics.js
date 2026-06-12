async function loadAnalytics() {
  try {
    const res = await fetch(API_BASE_URL + "/admin/analytics");
    const data = await res.json();

    document.getElementById("totalComplaints").innerText = data.total_complaints;
    document.getElementById("resolvedCount").innerText = data.resolved_count;
    document.getElementById("slaMet").innerText = data.sla_met_count;

  } catch (err) {
    console.error("Analytics error:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadAnalytics);
