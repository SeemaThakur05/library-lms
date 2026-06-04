function Backup({
  books,
  setBooks,
  students,
  setStudents,
}) {
  const downloadBackup = () => {
    const issuedBooks =
      JSON.parse(
        localStorage.getItem("issuedBooks")
      ) || [];

    const backupData = {
      books,
      students,
      issuedBooks,
      backupDate:
        new Date().toLocaleString(),
    };

    const blob = new Blob(
      [JSON.stringify(backupData, null, 2)],
      {
        type: "application/json",
      }
    );

    const link =
      document.createElement("a");

    link.href =
      URL.createObjectURL(blob);

    link.download =
      "Library_LMS_Backup.json";

    link.click();
  };

  const restoreBackup = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(
          event.target.result
        );

        if (
          !data.books ||
          !data.students ||
          !data.issuedBooks
        ) {
          alert("Invalid backup file");
          return;
        }

        setBooks(data.books);

        setStudents(data.students);

        localStorage.setItem(
          "issuedBooks",
          JSON.stringify(
            data.issuedBooks
          )
        );

        alert(
          "Backup restored successfully. Please refresh page."
        );
      } catch {
        alert(
          "Restore failed. Select valid backup file."
        );
      }
    };

    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "Delete ALL library data permanently?"
      )
    ) {
      localStorage.removeItem(
        "libraryBooks"
      );

      localStorage.removeItem(
        "libraryStudents"
      );

      localStorage.removeItem(
        "issuedBooks"
      );

      setBooks([]);

      setStudents([]);

      alert(
        "All data deleted successfully."
      );
    }
  };

  return (
    <section className="section-card">
      <h2>Backup & Restore</h2>

      <p>
        Download full backup or restore
        previous data.
      </p>

      <div className="form-box">
        <button
          type="button"
          onClick={downloadBackup}
        >
          Download Full Backup
        </button>

        <label className="file-upload">
          <b>Restore Backup</b>

          <input
            type="file"
            accept=".json"
            onChange={restoreBackup}
          />
        </label>

        <button
          type="button"
          className="delete-btn-full"
          onClick={clearAllData}
        >
          Clear All Data
        </button>
      </div>

      <h2 style={{ marginTop: "25px" }}>
        Backup Summary
      </h2>

      <table>
        <thead>
          <tr>
            <th>Data Type</th>
            <th>Total Records</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Books</td>
            <td>{books.length}</td>
          </tr>

          <tr>
            <td>Students</td>
            <td>{students.length}</td>
          </tr>

          <tr>
            <td>
              Issue / Return Records
            </td>

            <td>
              {JSON.parse(
                localStorage.getItem(
                  "issuedBooks"
                )
              )?.length || 0}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default Backup;