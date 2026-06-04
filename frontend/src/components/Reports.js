import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

function Reports({ books = [], students = [] }) {
  const [records, setRecords] = useState([]);
  const [reportType, setReportType] = useState("Issued");
  const [searchText, setSearchText] = useState("");

  const loadRecords = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/issues");
      const data = await response.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setRecords([]);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const today = new Date();

  const filteredRecords = records.filter((r) => {
    const text = searchText.toLowerCase();

    const matchesSearch =
      (r.accessionNo || "").toString().toLowerCase().includes(text) ||
      (r.bookTitle || "").toLowerCase().includes(text) ||
      (r.studentName || "").toLowerCase().includes(text) ||
      (r.rollNo || "").toLowerCase().includes(text) ||
      (r.memberType || "").toLowerCase().includes(text);

    if (!matchesSearch) return false;

    if (reportType === "Issued") return r.status === "Issued";
    if (reportType === "Returned") return r.status === "Returned";
    if (reportType === "Fine") return Number(r.fine || 0) > 0;

    if (reportType === "Overdue") {
      if (r.status !== "Issued") return false;
      return new Date(r.dueDate) < today;
    }

    return true;
  });

  const totalFine = filteredRecords.reduce(
    (sum, r) => sum + Number(r.fine || 0),
    0
  );

  const exportExcel = () => {
    const data = filteredRecords.map((r) => ({
      Accession: r.accessionNo,
      Title: r.bookTitle,
      "Member Type": r.memberType,
      Name: r.studentName,
      "Roll/ID": r.rollNo,
      "Registration No.": r.registrationNo,
      Mobile: r.mobile,
      "Issue Date": r.issueDate,
      "Due Date": r.dueDate,
      "Return Date": r.returnDate || "-",
      Fine: r.fine || 0,
      Status: r.status,
      "Reissue Count": r.reissueCount || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, reportType);
    XLSX.writeFile(workbook, `${reportType}_Report.xlsx`);
  };

  const printReport = () => {
    const printWindow = window.open("", "_blank", "width=1000,height=800");

    printWindow.document.write(`
      <html>
        <head>
          <title>${reportType} Report</title>
          <style>
            body {
              font-family: Arial;
              padding: 20px;
            }

            h2, h3 {
              text-align: center;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid #000;
              padding: 8px;
              font-size: 12px;
              text-align: center;
            }

            th {
              background: #eee;
            }
          </style>
        </head>

        <body>
          <h2>Late S. Chattar Singh Tehsildar Memorial Library</h2>
          <h3>${reportType} Report</h3>

          <p><b>Total Records:</b> ${filteredRecords.length}</p>
          <p><b>Total Fine:</b> ₹${totalFine}</p>

          <table>
            <thead>
              <tr>
                <th>Accession</th>
                <th>Title</th>
                <th>Member Type</th>
                <th>Name</th>
                <th>Roll/ID</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Fine</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${filteredRecords
                .map(
                  (r) => `
                    <tr>
                      <td>${r.accessionNo || ""}</td>
                      <td>${r.bookTitle || ""}</td>
                      <td>${r.memberType || ""}</td>
                      <td>${r.studentName || ""}</td>
                      <td>${r.rollNo || ""}</td>
                      <td>${r.issueDate || ""}</td>
                      <td>${r.dueDate || ""}</td>
                      <td>${r.returnDate || "-"}</td>
                      <td>₹${r.fine || 0}</td>
                      <td>${r.status || ""}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>

          <script>
            window.print();
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <section className="section-card">
      <h2>Reports</h2>

      <div className="form-box">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option>Issued</option>
          <option>Returned</option>
          <option>Overdue</option>
          <option>Fine</option>
          <option>All</option>
        </select>

        <input
          placeholder="Search by accession, title, member, roll/id"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button type="button" onClick={exportExcel}>
          📊 Export Excel
        </button>

        <button type="button" onClick={printReport}>
          🖨️ Print Report
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: "20px" }}>
        <div className="stat-card blue">
          <div>
            <h3>Total Records</h3>
            <h1>{filteredRecords.length}</h1>
          </div>
        </div>

        <div className="stat-card orange">
          <div>
            <h3>Total Fine</h3>
            <h1>₹{totalFine}</h1>
          </div>
        </div>

        <div className="stat-card green">
          <div>
            <h3>Total Books</h3>
            <h1>{books.length}</h1>
          </div>
        </div>

        <div className="stat-card purple">
          <div>
            <h3>Total Members</h3>
            <h1>{students.length}</h1>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Accession</th>
            <th>Title</th>
            <th>Member Type</th>
            <th>Name</th>
            <th>Roll/ID</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Fine</th>
            <th>Status</th>
            <th>Reissue</th>
          </tr>
        </thead>

        <tbody>
          {filteredRecords.map((r) => (
            <tr
  key={r._id}
  style={{
    background:
      r.status === "Issued" && new Date(r.dueDate) < new Date()
        ? "#fee2e2"
        : "white",
  }}
>
              <td>{r.accessionNo}</td>
              <td>{r.bookTitle}</td>
              <td>{r.memberType}</td>
              <td>{r.studentName}</td>
              <td>{r.rollNo}</td>
              <td>{r.issueDate}</td>
              <td>{r.dueDate}</td>
              <td>{r.returnDate || "-"}</td>
              <td>₹{r.fine || 0}</td>
              <td>
                <span className="status-badge">{r.status}</span>
              </td>
              <td>{r.reissueCount || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Reports;