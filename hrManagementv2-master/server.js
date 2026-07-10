const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "hrPortal")));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pe@ce2020",
  database: "elcms"
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL!");
  }
});

// GET all staff
app.get("/api/staffs", (req, res) => {
  db.query(
    "SELECT e.*, d.Department_Name FROM employee e LEFT JOIN department d ON e.Department_id = d.Department_id",
    (err, results) => {
      if (err) {
        res.json({ success: false, error: err.message });
      } else {
        res.json({ success: true, data: results });
      }
    },
  );
});

// get all departments
app.get("/api/departments", (req, res) => {
  db.query("SELECT * FROM department", (err, results) => {
    if (err) {
      res.json({ success: false, error: err.message });
    } else {
      res.json({ success: true, data: results });
    }
  });
});

// get all contracts
app.get("/api/contracts", (req, res) => {
  db.query(
    "SELECT c.*, e.F_Name, e.L_Name, d.Department_Name FROM contract c LEFT JOIN employee e ON c.Employee_id = e.Employee_id LEFT JOIN department d ON e.Department_id = d.Department_id",
    (err, results) => {
      if (err) {
        res.json({ success: false, error: err.message });
      } else {
        res.json({ success: true, data: results });
      }
    },
  );
});

// get all leave balances
app.get("/api/leaveBalances", (req, res) => {
  db.query(
    "SELECT lb.*, e.F_Name, e.L_Name FROM leave_balance lb LEFT JOIN employee e ON lb.Employee_id = e.Employee_id",
    (err, results) => {
      if (err) {
        res.json({ success: false, error: err.message });
      } else {
        res.json({ success: true, data: results });
      }
    },
  );
});

// get all leave requests
app.get("/api/leaveTable", (req, res) => {
  db.query(
    "SELECT lt.*, e.F_Name, e.L_Name FROM leave lt LEFT JOIN employee e ON lt.Employee_id = e.Employee_id",
    (err, results) => {
      if (err) {
        res.json({ success: false, error: err.message });
      } else {
        res.json({ success: true, data: results });
      }
    },
  );
});

// add new contract
app.post("/api/contracts", (req, res) => {
  const data = req.body;
  db.query("INSERT INTO contract SET ?", data, (err, results) => {
    if (err) {
      res.json({ success: false, error: err.message });
    } else {
      res.json({
        success: true,
        message: "contract added!",
        id: results.insertId,
      });
    }
  });
});

// add new staff
app.post("/api/staffs", (req, res) => {
  const data = req.body;
  db.query("INSERT INTO employee SET ?", data, (err, results) => {
    if (err) {
      res.json({ success: false, error: err.message });
    } else {
      res.json({
        success: true,
        message: "staff added!",
        id: results.insertId,
      });
    }
  });
});

// add new department
app.post("/api/departments", (req, res) => {
  const data = req.body;
  db.query("INSERT INTO department SET ?", data, (err, results) => {
    if (err) {
      res.json({ success: false, error: err.message });
    } else {
      res.json({
        success: true,
        message: "department added!",
        id: results.insertId,
      });
    }
  });
});

// add new leave request
app.post("/api/leaveTable", (req, res) => {
  const data = req.body;
  db.query("INSERT INTO leave SET ?", data, (err, results) => {
    if (err) {
      res.json({ success: false, error: err.message });
    } else {
      res.json({ success: true, message: "new leave request added!" });
    }
  });
});

// add new leave balance
app.post("/api/leaveBalances", (req, res) => {
  const data = req.body;
  db.query("INSERT INTO leave_balance SET ?", data, (err, results) => {
    if (err) {
      res.json({ success: false, error: err.message });
    } else {
      res.json({ success: true, message: "leaveBalance recorded !" });
    }
  });
});

app.put("/api/leaveTable/:id", (req, res) => {
  const { Status } = req.body;
  db.query(
    "UPDATE leave SET Status = ? WHERE Leave_id = ?",
    [Status, req.params.id],
    (err, result) => {
      if (err) res.json({ success: false, error: err.message });
      else res.json({ success: true, message: "Leave updated!" });
    },
  );
});

app.put("/api/staffs/:id", (req, res) => {
  let EmploymentStatus = req.body.EmploymentStatus || req.body.Status || req.body.status;
  if (!EmploymentStatus) {
    return res.status(400).json({ success: false, error: "EmploymentStatus is required" });
  }

  EmploymentStatus = String(EmploymentStatus).trim();
  if (/^inactive$/i.test(EmploymentStatus) || EmploymentStatus === "InActive") {
    EmploymentStatus = "InActive";
  } else if (/^active$/i.test(EmploymentStatus)) {
    EmploymentStatus = "Active";
  } else if (/^suspended$/i.test(EmploymentStatus)) {
    EmploymentStatus = "Suspended";
  }

  db.query(
    "UPDATE employee SET EmploymentStatus = ? WHERE Employee_id = ?",
    [EmploymentStatus, req.params.id],
    (err, result) => {
      if (err) {
        res.json({ success: false, error: err.message });
      } else if (result.affectedRows === 0) {
        res.json({ success: false, error: "No staff record updated" });
      } else {
        res.json({ success: true, message: "Staff status updated!" });
      }
    },
  );
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
