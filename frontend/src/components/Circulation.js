import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "https://library-lms-backend.onrender.com";

function Circulation({ books = [], setBooks, students = [] }) {
  const librarySettings =
    JSON.parse(localStorage.getItem("librarySettings")) || {};

  const studentIssueDays = Number(librarySettings.studentIssueDays || 14);
  const teacherIssueDays = Number(librarySettings.teacherIssueDays || 30);
  const finePerDay = Number(librarySettings.finePerDay || 1);
  const maxFine = Number(librarySettings.maxFine || 100);

  const [records, setRecords] = useState([]);

  const [issueData, setIssueData] = useState({
    accessionNo: "",
    memberType: "Student",
    studentName: "",
    rollNo: "",
    registrationNo: "",
    mobile: "",
  });

  const loadRecords = async () => {
    try {
      const response = await fetch(`${API_URL}/api/issues`);
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

  const handleChange = (e) => {
    setIssueData({
      ...issueData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateFine = (dueDate) => {
    if (!dueDate) return 0;

    const today = new Date();
    const due = new Date(dueDate);

    if (today <= due) return 0;

    const diffDays = Math.ceil(
      (today - due) / (1000 * 60 * 60 * 24)
    );

    let fine = diffDays * finePerDay;

    if (fine > maxFine) {
      fine = maxFine;
    }

    return fine;
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const issueBook = async (e) => {
    e.preventDefault();

    const selectedBook = books.find(
      (b) =>
        b.accNo?.toString() === issueData.accessionNo?.toString()
    );

    if (!selectedBook) {
      alert("Book not found");
      return;
    }

    const availability =
      selectedBook.availability ||
      selectedBook.status ||
      "Available";

    if (availability === "Issued") {
      alert("Book already issued");
      return;
    }

    const today = new Date();
    const due = new Date();

    if (issueData.memberType === "Teacher") {
      due.setDate(today.getDate() + teacherIssueDays);
    } else {
      due.setDate(today.getDate() + studentIssueDays);
    }

    const newRecord = {
      accessionNo: selectedBook.accNo,
      bookTitle: selectedBook.title,
      memberType: issueData.memberType,
      studentName: issueData.studentName,
      rollNo: issueData.rollNo,
      registrationNo: issueData.registrationNo,
      mobile: issueData.mobile,
      issueDate: formatDate(today),
      dueDate: formatDate(due),
      returnDate: "",
      status: "Issued",
      fine: 0,
      reissueCount: 0,
    };

    try {
      const response = await fetch(
        `${API_URL}/api/issues`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRecord),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Issue failed");
        return;
      }

      setRecords([data.record, ...records]);

      setBooks(
        books.map((b) =>
          b.accNo === selectedBook.accNo
            ? {
                ...b,
                availability: "Issued",
                status: "Issued",
              }
            : b
        )
      );

      setIssueData({
        accessionNo: "",
        memberType: "Student",
        studentName: "",
        rollNo: "",
        registrationNo: "",
        mobile: "",
      });

      alert("Book issued successfully");
    } catch (error) {
      console.log(error);
      alert("Issue failed");
    }
  };

  const returnBook = async (record) => {
    if (!window.confirm("Return this book?")) return;

    const today = new Date();
    const fine = calculateFine(record.dueDate);

    try {
      const response = await fetch(
        `${API_URL}/api/issues/return/${record._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Returned",
            returnDate: formatDate(today),
            fine,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Return failed");
        return;
      }

      setRecords(
        records.map((r) =>
          r._id === record._id ? data.record : r
        )
      );

      setBooks(
        books.map((b) =>
          b.accNo === record.accessionNo
            ? {
                ...b,
                availability: "Available",
                status: "Available",
              }
            : b
        )
      );

      alert(`Book returned successfully\nFine: ₹${fine}`);
    } catch (error) {
      console.log(error);
      alert("Return failed");
    }
  };

  const reissueBook = async (record) => {
    if (record.status !== "Issued") {
      alert("Only issued books can be reissued");
      return;
    }

    const due = new Date();

    if (record.memberType === "Teacher") {
      due.setDate(due.getDate() + teacherIssueDays);
    } else {
      due.setDate(due.getDate() + studentIssueDays);
    }

    try {
      const response = await fetch(
        `${API_URL}/api/issues/reissue/${record._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dueDate: formatDate(due),
            reissueCount: (record.reissueCount || 0) + 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Reissue failed");
        return;
      }

      setRecords(
        records.map((r) =>
          r._id === record._id ? data.record : r
        )
      );

      alert("Book reissued successfully");
    } catch (error) {
      console.log(error);
      alert("Reissue failed");
    }
  };

  const exemptFine = async (record) => {
    if (!window.confirm("Exempt fine for this record?")) return;

    try {
      const response = await fetch(
        `https://library-lms-backend.onrender.com/api/issues/return/${record._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fine: 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Fine exemption failed");
        return;
      }

      setRecords(
        records.map((r) =>
          r._id === record._id ? data.record : r
        )
      );

      alert("Fine exempted successfully");
    } catch (error) {
      console.log(error);
      alert("Fine exemption failed");
    }
  };

  const deleteRecord = async (record) => {
    if (!window.confirm("Delete this circulation record?")) return;

    try {
      const response = await fetch(
        `${API_URL}/api/issues/${record._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        alert("Delete failed");
        return;
      }

      setRecords(records.filter((r) => r._id !== record._id));

      alert("Record deleted successfully");
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  return (
    <section className="section-card">
      <h2>Circulation System</h2>

      <form className="form-box" onSubmit={issueBook}>
        <input
  name="accessionNo"
  placeholder="Scan / Enter Book Accession No."
  value={issueData.accessionNo}
  onChange={handleChange}
  autoFocus
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("memberBarcodeInput")?.focus();
    }
  }}
/>

        <select
          name="memberType"
          value={issueData.memberType}
          onChange={handleChange}
        >
          <option>Student</option>
          <option>Teacher</option>
        </select>

        <input
          name="studentName"
          placeholder="Member Name"
          value={issueData.studentName}
          onChange={handleChange}
        />

        <input
          name="rollNo"
          placeholder="Roll No. / Teacher ID"
          value={issueData.rollNo}
          onChange={handleChange}
        />

        <input
          name="registrationNo"
          placeholder="Registration No."
          value={issueData.registrationNo}
          onChange={handleChange}
        />

        <input
          name="mobile"
          placeholder="Mobile No."
          value={issueData.mobile}
          onChange={handleChange}
        />

        <button type="submit">Issue Book</button>
      </form>

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
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => {
            const liveFine =
              record.status === "Issued"
                ? calculateFine(record.dueDate)
                : Number(record.fine || 0);

            const isOverdue =
              record.status === "Issued" && liveFine > 0;

            return (
              <tr
                key={record._id}
                style={{
                  background: isOverdue ? "#fee2e2" : "white",
                }}
              >
                <td>{record.accessionNo}</td>
                <td>{record.bookTitle}</td>
                <td>{record.memberType}</td>
                <td>{record.studentName}</td>
                <td>{record.rollNo}</td>
                <td>{record.issueDate}</td>
                <td>{record.dueDate}</td>
                <td>{record.returnDate || "-"}</td>
                <td>₹{liveFine}</td>

                <td>
                  <span className="status-badge">
                    {record.status}
                  </span>
                </td>

                <td>{record.reissueCount || 0}</td>

                <td>
                  <div className="action-buttons">
                    {record.status === "Issued" && (
                      <>
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => reissueBook(record)}
                          title="Reissue"
                        >
                          🔄
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => returnBook(record)}
                          title="Return"
                        >
                          ↩️
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => exemptFine(record)}
                      title="Fine Exempt"
                    >
                      ₹0
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => deleteRecord(record)}
                      title="Delete Record"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default Circulation;