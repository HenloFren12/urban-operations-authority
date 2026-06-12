async function loadComplaints() {
  try {
    const res = await fetch("http://127.0.0.1:8000/admin/complaints");
    const complaints = await res.json();

    const tbody = document.getElementById("complaintsBody");
    tbody.innerHTML = "";

    complaints.forEach(c => {
      const row = `
        <tr>
          <td>${c.id}</td>
          <td>${c.category}</td>
          <td>${c.description_refined || c.description_raw}</td>
          <td>${new Date(c.created_at).toLocaleString()}</td>
          <td>${c.priority_score ?? "-"}</td>
          <td>${c.status}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    });

  } catch (err) {
    console.error("Error loading complaints:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadComplaints);