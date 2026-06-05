import { useState, useEffect } from "react";

function NoDues() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [studentRecords, setStudentRecords] = useState([]);

  useEffect(() => {
    fetch("https://library-lms-backend.onrender.com/api/issues")
      .then((res) => res.json())
      .then((data) => setRecords(data))
      .catch(() => setRecords([]));
  }, []);

  const checkStudent = () => {
    const result = records.filter(
      (r) =>
        r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        r.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
        r.registrationNo?.toLowerCase().includes(search.toLowerCase())
    );

    setStudentRecords(result);
  };

  const pendingBooks = studentRecords.filter(
    (r) => r.status === "Issued"
  );

  const printCertificate = () => {
  const student = studentRecords[0];

  const win = window.open("", "_blank");

  win.document.write(`
    <html>
      <head>
        <title>No Dues Certificate</title>

        <style>
          body{
            font-family: Arial;
            padding:40px;
            line-height:1.8;
          }

          h1,h2,h3{
            text-align:center;
            margin:0;
          }

          .certificate{
            border:3px solid #000;
            padding:40px;
            margin-top:20px;
          }

          .signatures{
            margin-top:80px;
            display:flex;
            justify-content:space-between;
          }

          .sign{
            text-align:center;
            width:200px;
          }

          hr{
            margin-top:40px;
          }
        </style>
      </head>

      <body>

        <h2>Amar Shaheed Baba Ajit Singh Jujhar Singh Memorial College, Bela</h2>
        <h3>(An Autonomous College)</h3>

        <div class="certificate">

          <h1>NO DUES CERTIFICATE</h1>

          <p>
            This is to certify that
            <b>${student.studentName}</b>
            bearing Roll No.
            <b>${student.rollNo}</b>
            and Registration No.
            <b>${student.registrationNo || "-"}</b>
            has returned all library books and has no outstanding dues in the
            Late S. Chattar Singh Tehsildar Memorial Library.
          </p>

          <p>
            Therefore, No Dues Certificate is hereby issued for academic and administrative purposes.
          </p>

          <br>

          <p>
            Date:
            ${new Date().toLocaleDateString()}
          </p>

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

        <script>
          window.print();
        </script>

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

        <button onClick={checkStudent}>
          Check
        </button>
      </div>

      {studentRecords.length > 0 && (
        <>
          {pendingBooks.length === 0 ? (
            <div className="success-box">
              <h3>No Dues Clear ✅</h3>

              <button onClick={printCertificate}>
                Print Certificate
              </button>
            </div>
          ) : (
            <div className="error-box">
              <h3>
                Pending Books: {pendingBooks.length}
              </h3>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NoDues;