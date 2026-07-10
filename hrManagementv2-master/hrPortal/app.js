const API = "http://localhost:3000";

// ── Toggle Sidebar ──
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  sidebar.classList.toggle("collapsed");
  overlay.classList.toggle("hidden");
}

// ── Navigation ──
function showSection(name) {
  // Close sidebar on mobile when navigating
  const sidebar = document.querySelector(".sidebar");
  if (window.innerWidth <= 768 && !sidebar.classList.contains("collapsed")) {
    toggleSidebar();
  }
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("section-" + name).classList.add("active");
  event.currentTarget.classList.add("active");
  document.getElementById("page-title").textContent =
    event.currentTarget.textContent.slice(2);
  loadSection(name);
}

function toggleProfileMenu() {
  const menu = document.getElementById("profile-menu");
  menu.classList.toggle("hidden");
}

function closeProfileMenu() {
  const menu = document.getElementById("profile-menu");
  if (!menu.classList.contains("hidden")) menu.classList.add("hidden");
}

window.addEventListener("click", (event) => {
  const menu = document.getElementById("profile-menu");
  const button = document.querySelector(".profile-button");
  if (!button.contains(event.target) && !menu.contains(event.target)) {
    closeProfileMenu();
  }
});

function loadSection(name) {
  if (name === "dashboard") loadDashboard();
  if (name === "staff") loadStaff();
  if (name === "departments") loadDepartments();
  if (name === "contracts") loadContracts();
  if (name === "leaves") loadLeaves();
  if (name === "leavebalance") loadLeaveBalance();
}

// ── Modal ──
function openModal(id) {
  document.getElementById(id).classList.add("open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

// ── Toast ──
function toast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + type;
  setTimeout(() => (t.className = ""), 3000);
}

// ── Dashboard ──
async function loadDashboard() {
  const [staff, dept, contracts, leaves] = await Promise.all([
    fetch(API + "/api/staffs").then((r) => r.json()),
    fetch(API + "/api/departments").then((r) => r.json()),
    fetch(API + "/api/contracts").then((r) => r.json()),
    fetch(API + "/api/leaveTable").then((r) => r.json()),
  ]);

  document.getElementById("stat-staff").textContent = staff.data?.length || 0;
  document.getElementById("stat-dept").textContent = dept.data?.length || 0;
  document.getElementById("stat-contracts").textContent =
    contracts.data?.length || 0;
  const pending =
    leaves.data?.filter((l) => l.Status === "Pending").length || 0;
  document.getElementById("stat-leaves").textContent = pending;

  const tbody = document.querySelector("#dashboard-staff-table tbody");
  if (!staff.data?.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="color:#475569">No staff found</td></tr>';
    return;
  }
  tbody.innerHTML = staff.data
    .slice(0, 5)
    .map(
      (s) => `
      <tr>
        
        <td>${s.F_Name} ${s.L_Name}</td>
        <td>${s.Title || "—"}</td>
        <td>${s.Department_Name || "—"}</td>
        <td><span class="badge badge-green">${s.EmploymentStatus || "InActive"}</span></td>
      </tr>`,
    )
    .join("");
}

// ── Staff ──
async function loadStaff() {
  const res = await fetch(API + "/api/staffs").then((r) => r.json());
  const tbody = document.querySelector("#staff-table tbody");
  if (!res.data?.length) {
    tbody.innerHTML =
      '<tr><td colspan="10" style="color:#475569">No staff found</td></tr>';
    return;
  }

  tbody.innerHTML = res.data
    .map((s) => {
      const id = s.Employee_id ?? s.employeeId ?? s.employee_id;
      const status = s.EmploymentStatus ?? s.employmentStatus ?? s.Status ?? "Active";
      return `
      <tr>
        <td>${s.F_Name ?? s.f_name ?? s.firstName ?? "—"} ${s.L_Name ?? s.l_name ?? s.lastName ?? "—"}</td>
        <td>${s.E_mail ?? s.e_mail ?? s.email ?? "—"}</td>
        <td>${s.Phone_No ?? s.phone_no ?? "—"}</td>
        <td>${s.Title ?? "—"}</td>
        <td>${s.Department_Name ?? "—"}</td>
        <td>${s.DOJ?.split("T")[0] ?? "—"}</td>
        <td>${status}</td>
        <td>${s.Employee_type ?? s.employee_type ?? "—"}</td>
      </tr>`;
    })
    .join("");
}


async function addStaff() {
  const data = {
    F_Name: document.getElementById("s-firstName").value,
    L_Name: document.getElementById("s-lastName").value,
    DOB: document.getElementById("s-dob").value,
    Address: document.getElementById("s-address").value,
    Phone_No: document.getElementById("s-phone").value,
    E_mail: document.getElementById("s-email").value,
    DOJ: document.getElementById("s-joinedDate").value,
    Department_id: document.getElementById("s-departmentId").value || null,
    Title: document.getElementById("s-jobTitle").value,
    Employee_type: document.getElementById("s-employeeType").value,
    EmploymentStatus: "Active",
  };
  if (
    !data.F_Name ||
    !data.L_Name ||
    !data.E_mail ||
    !data.DOB ||
    !data.Address
  ) {
    return toast("Please fill in all required fields", "error");
  }
  const res = await fetch(API + "/api/staffs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
  if (res.success) {
    toast("Staff added!");
    closeModal("modal-add-staff");
    loadStaff();
  } else toast(res.error, "error");
}

// ── Departments ──
async function loadDepartments() {
  const res = await fetch(API + "/api/departments").then((r) => r.json());
  const tbody = document.querySelector("#dept-table tbody");
  if (!res.data?.length) {
    tbody.innerHTML =
      '<tr><td colspan="2" style="color:#475569">No departments found</td></tr>';
    return;
  }
  tbody.innerHTML = res.data
    .map(
      (d) => `<tr><td>${d.Department_id}</td><td>${d.Department_Name}</td></tr>`,
    )
    .join("");
}

async function addDepartment() {
  const name = document.getElementById("d-name").value;
  if (!name) return toast("Enter department name", "error");
  const res = await fetch(API + "/api/departments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Department_Name: name }),
  }).then((r) => r.json());
  if (res.success) {
    toast("Department added!");
    closeModal("modal-add-dept");
    loadDepartments();
  } else toast(res.error, "error");
}

// Load departments into staff form dropdown
async function loadDeptDropdown() {
  const res = await fetch(API + "/api/departments").then((r) => r.json());
  const sel = document.getElementById("s-departmentId");
  if (res.data) {
    res.data.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.Department_id;
      opt.textContent = d.Department_Name;
      sel.appendChild(opt);
    });
  }
}

// ── Contracts ──
async function loadContracts() {
  const res = await fetch(API + "/api/contracts").then((r) => r.json());
  const tbody = document.querySelector("#contract-table tbody");
  if (!res.data?.length) {
    tbody.innerHTML =
      '<tr><td colspan="8" style="color:#475569">No contracts found</td></tr>';
    return;
  }
  tbody.innerHTML = res.data
    .map(
      (c) => `
      <tr>
        
        <td>${c.F_Name} ${c.L_Name}</td>
        <td>${c.Department_Name || "—"}</td>
        <td>${c.Contract_type}</td>
        <td>${c.Start_date?.split("T")[0] || "—"}</td>
        <td>${c.End_date?.split("T")[0] || "—"}</td>
        <td>${c.Salary}</td>
        <td><span class="badge ${c.Is_Active == 1 ? "badge-green" : "badge-red"}">${c.Is_Active == 1 ? "Active" : "Inactive"}</span></td>
      </tr>`,
    )
    .join("");
}

async function addContract() {
  const data = {
    Employee_id: document.getElementById("c-employeeId").value,
    Contract_type: document.getElementById("c-contractType").value,
    Salary: document.getElementById("c-salary").value,
    Start_date: document.getElementById("c-startDate").value,
    End_date: document.getElementById("c-endDate").value,
    Is_Active: document.getElementById("c-contractStatus").value,
  };
  if (!data.Employee_id || !data.Start_date)
    return toast("Fill required fields", "error");
  const res = await fetch(API + "/api/contracts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
  if (res.success) {
    toast("Contract added!");
    closeModal("modal-add-contract");
    loadContracts();
  } else toast(res.error, "error");
}

// ── Leaves ──
async function loadLeaves() {
  const res = await fetch(API + "/api/leaveTable").then((r) => r.json());
  const tbody = document.querySelector("#leave-table tbody");
  if (!res.data?.length) {
    tbody.innerHTML =
      '<tr><td colspan="9" style="color:#475569">No leave requests found</td></tr>';
    return;
  }
  tbody.innerHTML = res.data
    .map(
      (l) => `
      <tr>
        <td>${l.Leave_id}</td> <td>${l.F_Name} ${l.L_Name}</td><td>${l.Leave_type}</td>
        <td>${l.Leave_start?.split("T")[0] || "—"}</td>
        <td>${l.Leave_end?.split("T")[0] || "—"}</td>
        <td>${l.Total_days}</td><td>${l.Reasons || "—"}</td>
        <td><span class="badge ${l.Status === "Approved" ? "badge-green" : l.Status === "Rejected" ? "badge-red" : "badge-yellow"}">${l.Status}</span></td>
        <td>
          ${l.Status === "Pending" ? '<button class="btn btn-success btn-sm" onclick="updateLeave(' + l.Leave_id + ', \'Approved\')">Approve</button><button class="btn btn-danger btn-sm" onclick="updateLeave(' + l.Leave_id + ', \'Rejected\')">Reject</button>' : "—"}
        </td>
      </tr>`,
    )
    .join("");
}

async function addLeave() {
  const data = {
    Employee_id: document.getElementById("l-employeeId").value,
    Leave_type: document.getElementById("l-leaveType").value,
    Leave_start: document.getElementById("l-leaveStart").value,
    Leave_end: document.getElementById("l-leaveEnd").value,
    Total_days: document.getElementById("l-totalDays").value,
    Reasons: document.getElementById("l-reasons").value,
    Status: "Pending",
    Submitted_date: document.getElementById("l-submittedDate").value,
  };
  if (!data.Employee_id || !data.Leave_start || !data.Leave_end)
    return toast("Fill required fields", "error");
  const res = await fetch(API + "/api/leaveTable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
  if (res.success) {
    toast("Leave request submitted!");
    closeModal("modal-add-leave");
    loadLeaves();
  } else toast(res.error, "error");
}

async function updateLeave(id, status) {
  const res = await fetch(`${API}/api/leaveTable/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Status: status }),
  }).then((r) => r.json());
  if (res.success) {
    toast(`Leave ${status}!`);
    loadLeaves();
  } else toast(res.error, "error");
}

// ── Leave Balance ──
async function loadLeaveBalance() {
  const res = await fetch(API + "/api/leaveBalances").then((r) => r.json());
  const tbody = document.querySelector("#leavebalance-table tbody");
  if (!res.data?.length) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="color:#475569">No records found</td></tr>';
    return;
  }
  tbody.innerHTML = res.data
    .map(
      (b) => `
      <tr>
        <td>${b.Balance_id}</td> <td>${b.F_Name} ${b.L_Name}</td><td>${b.Leave_type}</td>
        <td>${b.Year}</td><td>${b.Total_Entitlement}</td><td>${b.Remeaning_days}</td>
      </tr>`,
    )
    .join("");
}

// ── Init ──
window.onload = () => {
  loadDashboard();
  loadDeptDropdown();
};
