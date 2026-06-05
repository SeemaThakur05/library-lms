import { useState, useEffect } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://library-lms-backend.onrender.com";

function NoDues() {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [studentRecords, setStudentRecords] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/issues`)
      .then((res) => res.json())
      .then((data) => setRecords(Array.isArray(data) ? data : []))
      .catch(() => setRecords([]));

    fetch(`${API_URL}/api/members`)
      .then((res) => res.json())
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]));
  }, []);

  const checkStudent = () => {
    const text = search.trim().toLowerCase();

    if (!text) {
      alert("Enter Name / Roll No / Registration No");
      return;
    }

    const member = members.find(
      (m) =>
        m.name?.toLowerCase().includes(text) ||
        m.rollNo?.toLowerCase().includes(text) ||
        m.registrationNo?.toLowerCase().includes(text)
    );

    if (!member) {
      setSelectedMember(null);
      setStudentRecords([]);
      alert("Member not found");
      return;
    }

    const history = records.filter(
      (r) =>
        r.rollNo?.toString().toLowerCase() ===
          member.rollNo?.toString().toLowerCase() ||
        r.registrationNo?.toString().toLowerCase() ===
          member.registrationNo?.toString().toLowerCase() ||
        r.studentName?.toLowerCase() === member.name?.toLowerCase()
    );

    setSelectedMember(member);
    setStudentRecords(history);
  };

  const pendingBooks = studentRecords.filter((r) => r.status === "Issued");

  const printCertificate = () => {
    if (!selectedMember) {
      alert("Please check member first");
      return;
    }

    const win = window.open("", "_blank");

    win.document.write(`
      <html>
        <head>
          <title>No Dues Certificate</title>
          <style>
            body{font-family: Arial; padding:40px; line-height:1.8;}
            h1,h2,h3{text-align:center; margin:0;}
            .certificate{border:3px solid #000; padding:40px; margin-top:20px;}
            .signatures{margin-top:80px; display:flex; justify-content:space-between;}
            .sign{text-align:center; width:200px;}
          </style>
        </head>
        <body>
          <h2>Amar Shaheed Baba Ajit Singh Jujhar Singh Memorial College, Bela</h2>
          <h3>(An Autonomous College)</h3>

          <div class="certificate">
            <h1>NO DUES CERTIFICATE</h1>

            <p>
              This is to certify that
              <b>${selectedMember.name}</b>
              bearing Roll No./ID
              <b>${selectedMember.rollNo || "-"}</b>
              and Registration No.
              <b>${selectedMember.registrationNo || "-"}</b>
              has returned all library books and has no outstanding dues in the
              Late S. Chattar Singh Tehsildar Memorial Library.
            </p>

            <p>
              Therefore, No Dues Certificate is hereby issued for academic and administrative purposes.
            </p>

            <p>Date: ${new Date().toLocaleDateString()}</p>

            <div class="signatures">
              <div class="sign">
                ___________________
                <br>
                Librarian
              </div>

              <div class="sign">
                ___________________
                <br>
                Principal
              </div>
            </div>
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `);

    win.document.close();
  };

  return (
    <div className="section-card">
      <h2>No Dues Certificate</h2>

      <div className="form-box">
        <input
          placeholder="Name / Roll No / Registration No"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={checkStudent}>Check</button>
      </div>

      {selectedMember && (
        <>
          <div className="success-box">
            <h3>
              Member Found: {selectedMember.name} ({selectedMember.rollNo || "-"})
            </h3>
          </div>

          {pendingBooks.length === 0 ? (
            <div className="success-box">
              <h3>No Dues Clear ✅</h3>
              <button onClick={printCertificate}>Print Certificate</button>
            </div>
          ) : (
            <div className="error-box">
              <h3>Pending Books: {pendingBooks.length}</h3>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NoDues;