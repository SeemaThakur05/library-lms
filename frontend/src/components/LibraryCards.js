import { useState } from "react";
import Barcode from "react-barcode";

function LibraryCards({ students = [] }) {
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter((s) => {
    const text = search.toLowerCase();

    return (
      (s.name || "").toLowerCase().includes(text) ||
      (s.studentName || "").toLowerCase().includes(text) ||
      (s.rollNo || "").toLowerCase().includes(text) ||
      (s.registrationNo || "").toLowerCase().includes(text) ||
      (s.className || "").toLowerCase().includes(text)
    );
  });

  const printSingleCard = (student) => {
    const barcodeValue =
      student.registrationNo || student.rollNo || "LIBRARY";

    const win = window.open("", "_blank", "width=420,height=700");

    win.document.write(`
      <html>
        <head>
          <title>Library Card</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              padding: 20px;
              background: #ffffff;
            }

            .college-id-card {
              width: 280px;
              min-height: 430px;
              border: 2px solid #d0d0d0;
              border-radius: 12px;
              overflow: hidden;
              background: white;
              margin: auto;
              box-shadow: none;
            }

            .id-header {
              background: #21448b;
              color: white;
              text-align: center;
              padding: 8px;
            }

            .id-logo {
              width: 42px;
              height: 42px;
              object-fit: contain;
              margin-bottom: 3px;
            }

            .id-header h3 {
              margin: 0;
              font-size: 22px;
              font-weight: bold;
            }

            .id-header p {
              margin: 2px 0;
              font-size: 11px;
            }

            .photo-section {
              text-align: center;
              margin-top: 10px;
            }

            .student-photo {
              width: 88px;
              height: 102px;
              object-fit: cover;
              border-radius: 50%;
              border: 3px solid #f0b05c;
              background: #f8fafc;
            }

            .photo-placeholder {
              width: 88px;
              height: 102px;
              border-radius: 50%;
              border: 3px solid #f0b05c;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: auto;
              font-size: 11px;
              color: #64748b;
            }

            .student-name {
              text-align: center;
              color: #c84d73;
              font-size: 16px;
              margin: 8px 0;
              font-weight: bold;
            }

            .id-details {
              padding: 0 12px;
              font-size: 11px;
              line-height: 1.35;
            }

            .id-details p {
              margin: 3px 0;
            }

            .barcode-area {
              text-align: center;
              margin-top: 8px;
            }

            .principal-sign {
              text-align: right;
              padding: 8px 14px 10px;
              font-size: 11px;
              font-weight: bold;
            }

            @media print {
              body {
                padding: 0;
              }

              .college-id-card {
                margin: 0 auto;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>

        <body>
          <div class="college-id-card">
            <div class="id-header">
              <img src="/logo.png" class="id-logo" />
              <h3>ASBASJSM</h3>
              <p>COLLEGE BELA (ROPAR) PUNJAB</p>
              <p>(140111)</p>
            </div>

            <div class="photo-section">
              ${
                student.photo
                  ? `<img src="${student.photo}" class="student-photo" />`
                  : `<div class="photo-placeholder">Photo</div>`
              }
            </div>

            <div class="student-name">
              ${student.name || student.studentName || "-"}
            </div>

            <div class="id-details">
              <p><b>COURSE :</b> ${student.className || "-"}</p>
              <p><b>ROLL NO :</b> ${student.rollNo || "-"}</p>
              <p><b>F.NAME :</b> ${student.fatherName || "-"}</p>
              <p><b>DOB :</b> ${student.dob || "-"}</p>
              <p><b>BLOOD G :</b> ${student.bloodGroup || "-"}</p>
              <p><b>PHONE :</b> ${student.mobile || "-"}</p>
              <p><b>VALIDITY :</b> ${student.validity || "-"}</p>
            </div>

            <div class="barcode-area">
              <svg id="barcode"></svg>
            </div>

            <div class="principal-sign">
              Principal
            </div>
          </div>

          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
          <script>
            JsBarcode("#barcode", "${barcodeValue}", {
              width: 1,
              height: 38,
              fontSize: 10,
              margin: 5,
              displayValue: true
            });

            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);

    win.document.close();
  };

  const printAllCards = () => {
    window.print();
  };

  return (
    <section className="section-card">
      <h2>Library Cards</h2>

      <div className="form-box">
        <input
          type="text"
          placeholder="Search by name, roll no, registration no or class"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="button" onClick={printAllCards}>
          🖨️ Print Visible Cards
        </button>
      </div>

      <div className="library-card-grid">
        {filteredStudents.map((student, index) => (
          <div className="college-id-card" key={index}>
            <div className="id-header">
              <img src="/logo.png" alt="Logo" className="id-logo" />

              <div>
                <h3>ASBASJSM</h3>
                <p>COLLEGE BELA (ROPAR) PUNJAB</p>
                <p>(140111)</p>
              </div>
            </div>

            <div className="photo-section">
              {student.photo ? (
                <img
                  src={student.photo}
                  alt="Student"
                  className="student-photo"
                />
              ) : (
                <div className="student-photo">Photo</div>
              )}
            </div>

            <h2 className="student-name">
              {student.name || student.studentName || "-"}
            </h2>

            <div className="id-details">
              <p>
                <b>COURSE :</b> {student.className || "-"}
              </p>
              <p>
                <b>ROLL NO :</b> {student.rollNo || "-"}
              </p>
              <p>
                <b>F.NAME :</b> {student.fatherName || "-"}
              </p>
              <p>
                <b>DOB :</b> {student.dob || "-"}
              </p>
              <p>
                <b>BLOOD G :</b> {student.bloodGroup || "-"}
              </p>
              <p>
                <b>PHONE :</b> {student.mobile || "-"}
              </p>
              <p>
                <b>VALIDITY :</b> {student.validity || "-"}
              </p>
            </div>

            <div className="barcode-box">
              <Barcode
                value={
                  student.registrationNo || student.rollNo || "LIBRARY"
                }
                height={38}
                width={1}
                fontSize={10}
                margin={5}
                displayValue={true}
              />
            </div>

            <div className="principal-sign">Principal</div>

            <button
              type="button"
              className="id-print-btn"
              onClick={() => printSingleCard(student)}
            >
              🖨️ Print Card
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default LibraryCards;