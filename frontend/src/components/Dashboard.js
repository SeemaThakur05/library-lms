import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "https://library-lms-backend.onrender.com";

function Dashboard({ books = [], students = [] }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/issues`)
      .then((res) => res.json())
      .then((data) => {
        setRecords(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.log(err);
        setRecords([]);
      });
  }, []);

  const today = new Date();

  const totalBooks = books.length;
  const totalMembers = students.length;

  const issuedBooks = records.filter((r) => r.status === "Issued").length;
  const returnedBooks = records.filter((r) => r.status === "Returned").length;

  const overdueBooks = records.filter((r) => {
    if (r.status !== "Issued") return false;
    return new Date(r.dueDate) < today;
  }).length;

  const pendingFine = records.reduce((sum, r) => {
    return sum + Number(r.fine || 0);
  }, 0);

  const bookBankBooks = books.filter(
    (b) => (b.bookType || "General") === "Book Bank"
  ).length;

  const availableBooks = books.filter(
    (b) => (b.availability || b.status || "Available") === "Available"
  ).length;

  const cards = [
    {
      title: "Total Books",
      value: totalBooks,
      subtitle: "Complete collection",
      icon: "📚",
      color: "purple",
    },
    {
      title: "Available Books",
      value: availableBooks,
      subtitle: "Ready to issue",
      icon: "✅",
      color: "green",
    },
    {
      title: "Issued Books",
      value: issuedBooks,
      subtitle: "Currently issued",
      icon: "🔄",
      color: "orange",
    },
    {
      title: "Overdue Books",
      value: overdueBooks,
      subtitle: "Need follow-up",
      icon: "⚠️",
      color: "red",
    },
    {
      title: "Book Bank Books",
      value: bookBankBooks,
      subtitle: "Book bank collection",
      icon: "🏦",
      color: "blue",
    },
    {
      title: "Total Members",
      value: totalMembers,
      subtitle: "Students + teachers",
      icon: "👥",
      color: "green",
    },
    {
      title: "Returned Books",
      value: returnedBooks,
      subtitle: "Returned records",
      icon: "↩️",
      color: "pink",
    },
    {
      title: "Fine Pending",
      value: `₹${pendingFine}`,
      subtitle: "Recorded fines",
      icon: "💰",
      color: "orange",
    },
  ];

  const recentActivities = records.slice(0, 5);

  return (
    <div className="modern-dashboard">
      <div className="modern-welcome">
        <div>
          <h1>Welcome, Admin!</h1>
          <p>Live library statistics and circulation overview.</p>
        </div>

        <div className="welcome-books">📚</div>
      </div>

      <div className="modern-stats dashboard-analytics-grid">
        {cards.map((card) => (
          <div className="modern-stat-card" key={card.title}>
            <div className={`modern-stat-icon ${card.color}`}>
              {card.icon}
            </div>

            <div>
              <h3>{card.title}</h3>
              <h2>{card.value}</h2>
              <p>{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-bottom-grid single-column">
        <div className="recent-card">
          <div className="recent-header">
            <h2>Recent Circulation Activities</h2>
            <span>{records.length} Records</span>
          </div>

          <div className="activity-list">
            {recentActivities.length === 0 && (
              <p>No recent circulation records found.</p>
            )}

            {recentActivities.map((r) => (
              <div className="activity-item" key={r._id}>
                <div className="activity-icon activity-blue">
                  {r.status === "Issued" ? "🔄" : "↩️"}
                </div>

                <div className="activity-text">
                  <h3>{r.bookTitle}</h3>
                  <p>
                    {r.status} to {r.studentName || "Member"} | Accession:{" "}
                    {r.accessionNo}
                  </p>
                </div>

                <span className="activity-time">
                  {r.status === "Issued" ? r.issueDate : r.returnDate || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        © 2026 Late S. Chattar Singh Tehsildar Memorial Library. All rights
        reserved.
      </div>
    </div>
  );
}

export default Dashboard;