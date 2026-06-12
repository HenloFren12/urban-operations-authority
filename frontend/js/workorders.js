async function loadWorkOrders() {
  try {
    const res = await fetch(API_BASE_URL + "/admin/work-orders");
    const data = await res.json();

    const tbody = document.getElementById("workOrdersBody");
    tbody.innerHTML = "";

    data.forEach(w => {
      const row = 
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      ;
      tbody.innerHTML += row;
    });

  } catch (err) {
    console.error("Work orders error:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadWorkOrders);
