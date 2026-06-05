import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Barcode from "react-barcode";
import "./styles/layout.css";
import "./styles/dashboard.css";
import "./styles/books.css";
import "./styles/circulation.css";
import "./styles/librarycards.css";
import "./styles/reports.css";
import "./styles/settings.css";

import Dashboard from "./components/Dashboard";
import Students from "./components/Students";
import Circulation from "./components/Circulation";
import Reports from "./components/Reports";
import NoDues from "./components/NoDues";
import LibraryCards from "./components/LibraryCards";
import Backup from "./components/Backup";
import Settings from "./components/Settings";

const API_URL = process.env.REACT_APP_API_URL || "https://library-lms-backend.onrender.com";

function App() {
  const emptyBook = {
    accNo: "",
    author: "",
    title: "",
    publisher: "",
    year: "",
    callNo: "",
    coverImage: "",
    availability: "Available",
    bookType: "General",
  };

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("libraryLogin") === "true";
  });

  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("libraryCurrentUser")) || null;
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [book, setBook] = useState(emptyBook);
  const [editingAccNo, setEditingAccNo] = useState(null);
  const [books, setBooks] = useState([]);
  const [booksLoaded, setBooksLoaded] = useState(false);

  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem("libraryStudents");
    return savedStudents ? JSON.parse(savedStudents) : [];
  });

  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("activeLibrarySection") || "home";
  });

  const [opacAccNo, setOpacAccNo] = useState("");
const [opacTitle, setOpacTitle] = useState("");
const [opacAuthor, setOpacAuthor] = useState("");
const [opacPublisher, setOpacPublisher] = useState("");
const [opacCallNo, setOpacCallNo] = useState("");
const [opacStatus, setOpacStatus] = useState("All");
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [bookTypeFilter, setBookTypeFilter] = useState("All");
  const [selectedBooks, setSelectedBooks] = useState([]);

  const [cataloguePage, setCataloguePage] = useState(() => {
    return Number(localStorage.getItem("cataloguePage")) || 1;
  });

  const booksPerPage = 50;

  const normalizeBook = (b) => ({
    ...b,
    availability: b.availability || b.status || "Available",
  });

  const loadBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/books`);
      const data = await response.json();
      setBooks(Array.isArray(data) ? data.map(normalizeBook) : []);
      setBooksLoaded(true);
    } catch (error) {
      console.log(error);
      setBooksLoaded(true);
    }
  };

  useEffect(() => {
  loadBooks();
  // eslint-disable-next-line
}, []);

  useEffect(() => {
    localStorage.setItem("libraryStudents", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("activeLibrarySection", activeSection);
  }, [activeSection]);

  useEffect(() => {
    localStorage.setItem("cataloguePage", cataloguePage);
  }, [cataloguePage]);

  useEffect(() => {
    setCataloguePage(1);
  }, [catalogueSearch, statusFilter]);

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("libraryLogin", "true");
      localStorage.setItem("libraryToken", data.token);
      localStorage.setItem("libraryCurrentUser", JSON.stringify(data.user));

      setCurrentUser(data.user);
      setIsLoggedIn(true);
      alert("Login successful");
    } catch (error) {
      alert("Backend not connected. Please start backend server.");
    }
  };

  const logout = () => {
    localStorage.removeItem("libraryLogin");
    localStorage.removeItem("libraryToken");
    localStorage.removeItem("libraryCurrentUser");
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const allMenuItems = [
    { key: "home", icon: "▦", title: "Dashboard" },
    { key: "cataloguing", icon: "📚", title: "Cataloguing" },
    { key: "circulation", icon: "🔄", title: "Circulation" },
    { key: "members", icon: "👤", title: "Members" },
    { key: "opac", icon: "🌐", title: "Web-OPAC" },
    { key: "reports", icon: "📄", title: "Reports" },
    { key: "nodues", icon: "✅", title: "No Dues" },
    { key: "librarycards", icon: "🪪", title: "Library Cards" },
    { key: "backup", icon: "🗄️", title: "Backup" },
    { key: "settings", icon: "⚙️", title: "Settings" },
  ];

  const menuItems = allMenuItems.filter((item) => {
  const role = currentUser?.role;

  if (role === "Super Admin") return true;

  if (role === "Librarian") {
    return [
      "home",
      "cataloguing",
      "circulation",
      "members",
      "opac",
      "reports",
      "backup",
    ].includes(item.key);
  }

  if (role === "Assistant") {
    return ["home", "circulation", "opac"].includes(item.key);
  }

  return false;
});

  const handleBookChange = (e) => {
    setBook({
      ...book,
      [e.target.name]: e.target.value,
    });
  };
  const handleCoverImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    setBook({
      ...book,
      coverImage: reader.result,
    });
  };

  reader.readAsDataURL(file);
};

  const saveBook = async (e) => {
    e.preventDefault();

    if (!book.accNo || !book.title) {
      alert("Accession No. and Title required");
      return;
    }

    const bookPayload = {
      ...book,
      status: book.availability || "Available",
    };

    try {
      if (editingAccNo) {
        const existingBook = books.find((b) => b.accNo === editingAccNo);

        if (!existingBook?._id) {
          alert("Book ID not found. Please refresh and try again.");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/books/${existingBook._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bookPayload),
          }
        );

        const updatedBook = await response.json();

        if (!response.ok) {
          alert(updatedBook.message || "Error updating book");
          return;
        }

        setBooks(
          books.map((b) =>
            b._id === updatedBook._id ? normalizeBook(updatedBook) : b
          )
        );

        setEditingAccNo(null);
        alert("Book updated successfully");
      } else {
        const response = await fetch(`${API_URL}/api/books`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Error saving book");
          return;
        }

        setBooks([...books, normalizeBook(data.book)]);
        alert("Book added successfully");
      }

      setBook(emptyBook);
    } catch (error) {
      console.log(error);
      alert("Backend error");
    }
  };

  const editBook = (selectedBook) => {
    setBook({
      accNo: selectedBook.accNo || "",
      author: selectedBook.author || "",
      title: selectedBook.title || "",
      publisher: selectedBook.publisher || "",
      year: selectedBook.year || "",
      callNo: selectedBook.callNo || "",
      availability: selectedBook.availability || selectedBook.status || "Available",
    });

    setEditingAccNo(selectedBook.accNo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Delete this book permanently?")) return;

    try {
      const response = await fetch(`${API_URL}/api/books/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Error deleting book");
        return;
      }

      setBooks(books.filter((b) => b._id !== id));
      setSelectedBooks([]);
      alert("Book deleted successfully");
    } catch (error) {
      console.log(error);
      alert("Error deleting book");
    }
  };

  const cancelEdit = () => {
    setBook(emptyBook);
    setEditingAccNo(null);
  };

  const handleBookExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const excelData = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
        });

        const newBooks = excelData
          .map((row) => {
            const accNo =
              row["Accession"] ||
              row["Accession No."] ||
              row["Accession No"] ||
              row["Acc. No."] ||
              row["Acc No"] ||
              row["Acc. No"] ||
              row["Acc No."] ||
              row["Accession Number"];

            if (!accNo) return null;

            const availability = row["Availability"] || "Available";

            return {
  accNo: accNo.toString().trim(),
  author: row["Author"] || "",
  title: row["Title"] || "",
  publisher:
    row["Publisher & Place"] ||
    row["Place & Publisher"] ||
    row["Publisher"] ||
    "",
  year: row["Year"] || "",
  callNo: row["Call No."] || row["Call No"] || "",
  bookType:
    row["Book Type"] ||
    row["Type"] ||
    row["Category"] ||
    "General",
  availability,
  status: availability,
};
              
          })
          .filter(Boolean);

        if (newBooks.length === 0) {
          alert("No valid books found in Excel file.");
          return;
        }

        const response = await fetch(`${API_URL}/api/books/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ books: newBooks }),
        });

        const result = await response.json();

        if (!response.ok) {
          alert(result.message || "Excel upload failed");
          return;
        }

        await loadBooks();
        setCataloguePage(1);
        e.target.value = "";

        alert(
          `Excel upload completed.\nInserted: ${result.inserted}\nSkipped duplicates: ${result.skipped}`
        );
      } catch (error) {
        console.log(error);
        alert("Excel upload failed");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const deleteSelectedBooks = () => {
    if (selectedBooks.length === 0) {
      alert("Select books first");
      return;
    }

    if (!window.confirm(`Delete ${selectedBooks.length} selected books?`)) {
      return;
    }

    const booksToDelete = books.filter((b) =>
      selectedBooks.includes(b.accNo)
    );

    Promise.all(
      booksToDelete.map((b) =>
        fetch(`${API_URL}/api/books/${b._id}`, {
          method: "DELETE",
        })
      )
    )
      .then(() => {
        setBooks(books.filter((b) => !selectedBooks.includes(b.accNo)));
        setSelectedBooks([]);
        alert("Selected books deleted successfully");
      })
      .catch((error) => {
        console.log(error);
        alert("Delete failed");
      });
  };

  const printSingleLabel = (b) => {
    const printWindow = window.open("", "_blank", "width=500,height=600");

    printWindow.document.write(`
      <html>
      <head>
        <title>Book Label</title>
        <style>
          body{font-family: Arial; padding:20px; text-align:center;}
          .label{border:2px solid #000; padding:20px; width:300px; margin:auto;}
          h2{margin-bottom:10px; font-size:18px;}
          p{margin:5px 0; font-size:14px;}
        </style>
      </head>
      <body>
        <div class="label">
          <h2>Late S. Chattar Singh Tehsildar Memorial Library</h2>
          <p><b>Accession No:</b> ${b.accNo}</p>
          <p><b>Title:</b> ${b.title}</p>
          <p><b>Author:</b> ${b.author}</p>
          <p><b>Call No:</b> ${b.callNo}</p>
          <svg id="barcode"></svg>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        <script>
          JsBarcode("#barcode", "${b.accNo}", {
            format:"CODE128",
            width:2,
            height:50,
            displayValue:true
          });
          window.print();
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const printSelectedLabels = () => {
    const selected = books.filter((b) => selectedBooks.includes(b.accNo));

    if (selected.length === 0) {
      alert("Select books first");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    printWindow.document.write(`
      <html>
      <head>
        <title>Print Labels</title>
        <style>
          body{font-family:Arial; padding:20px;}
          .container{display:flex; flex-wrap:wrap; gap:20px;}
          .label{width:300px; border:2px solid #000; padding:15px; text-align:center; page-break-inside:avoid;}
          h3{font-size:16px; margin:0 0 8px 0;}
          p{margin:4px 0; font-size:13px;}
        </style>
      </head>
      <body>
        <div class="container">
          ${selected
            .map(
              (b, i) => `
              <div class="label">
                <h3>Late S. Chattar Singh Tehsildar Memorial Library</h3>
                <p><b>Accession:</b> ${b.accNo}</p>
                <p><b>Title:</b> ${b.title}</p>
                <p><b>Author:</b> ${b.author}</p>
                <p><b>Call No:</b> ${b.callNo}</p>
                <svg id="barcode${i}"></svg>
              </div>
            `
            )
            .join("")}
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        <script>
          ${selected
            .map(
              (b, i) => `
              JsBarcode("#barcode${i}", "${b.accNo}", {
                format:"CODE128",
                width:2,
                height:45,
                displayValue:true
              });
            `
            )
            .join("")}
          window.print();
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const filteredCatalogueBooks = books.filter((b) => {
    const text = catalogueSearch.toLowerCase();
    const availability = b.availability || b.status || "Available";

    const matchesSearch =
      (b.accNo || "").toString().toLowerCase().includes(text) ||
      (b.title || "").toString().toLowerCase().includes(text) ||
      (b.author || "").toString().toLowerCase().includes(text);

    const bookType = b.bookType || "General";

const matchesStatus =
  statusFilter === "All"
    ? true
    : availability.toString().toLowerCase() === statusFilter.toLowerCase();

const matchesBookType =
  bookTypeFilter === "All"
    ? true
    : bookType.toLowerCase() === bookTypeFilter.toLowerCase();

return matchesSearch && matchesStatus && matchesBookType;
  });

  const filteredOpacBooks = books
  .filter((b) => {
    const status = b.availability || b.status || "Available";

    return (
      (b.accNo || "")
        .toString()
        .toLowerCase()
        .includes(opacAccNo.toLowerCase()) &&
      (b.title || "")
        .toLowerCase()
        .includes(opacTitle.toLowerCase()) &&
      (b.author || "")
        .toLowerCase()
        .includes(opacAuthor.toLowerCase()) &&
      (b.publisher || "")
        .toLowerCase()
        .includes(opacPublisher.toLowerCase()) &&
      (b.callNo || "")
        .toLowerCase()
        .includes(opacCallNo.toLowerCase()) &&
      (opacStatus === "All" ||
        status.toLowerCase() === opacStatus.toLowerCase())
    );
  })
  .sort((a, b) => Number(a.accNo) - Number(b.accNo));

  const sortedBooks = [...filteredCatalogueBooks].sort(
  (a, b) => Number(a.accNo) - Number(b.accNo)
);
  const totalCataloguePages = Math.ceil(sortedBooks.length / booksPerPage) || 1;
  const startIndex = (cataloguePage - 1) * booksPerPage;
  const currentCatalogueBooks = sortedBooks.slice(
    startIndex,
    startIndex + booksPerPage
  );

    const showIssuedInfo = (accNo) => {
    const issuedBooks = JSON.parse(localStorage.getItem("issuedBooks")) || [];

    const record = issuedBooks.find(
      (item) =>
        item.accessionNo?.toString() === accNo?.toString() &&
        item.status === "Issued"
    );

    if (!record) {
      alert("No issue record found for this book.");
      return;
    }

    alert(
      `Issued To: ${record.studentName}\nRoll No.: ${record.rollNo}\nRegistration No.: ${record.registrationNo}\nMobile: ${record.mobile || "-"}\nIssue Date: ${record.issueDate}\nDue Date: ${record.dueDate}`
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <form className="login-box" onSubmit={login}>
          <div className="login-icon">📚</div>
          <h1>Library LMS</h1>
          <p>Late S. Chattar Singh Tehsildar Memorial Library</p>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={loginData.username}
            onChange={handleLoginChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleLoginChange}
          />

          <button type="submit">Login</button>

          <div className="login-note">
            <b>Super Admin</b>
            <br />
            superadmin / super123
            <br />
            <br />
            <b>Librarian</b>
            <br />
            librarian / lib123
            <br />
            <br />
            <b>Assistant</b>
            <br />
            assistant / assist123
          </div>
        </form>
      </div>
    );
  }

  if (!booksLoaded) {
    return <div className="login-page">Loading Database...</div>;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">📖</span>
          <div>
            <h2>LMS</h2>
            <p>Library System</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={activeSection === item.key ? "active" : ""}
              onClick={() => setActiveSection(item.key)}
            >
              <span>{item.icon}</span>
              {item.title}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-area">
        <header className="top-header">
          <div>
            <h1>Late S. Chattar Singh Tehsildar Memorial Library</h1>
            <p>Library Management System</p>
          </div>

          <div className="header-right">
            <div className="admin-profile">👤 {currentUser?.role}</div>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {activeSection === "home" && (
          <Dashboard
            books={books}
            students={students}
            currentUser={currentUser}
          />
        )}

        {activeSection === "cataloguing" && (
          <section className="section-card">
            <h2>Cataloguing System</h2>

            <form className="form-box" onSubmit={saveBook}>
              <input
                name="accNo"
                placeholder="Accession No."
                value={book.accNo}
                onChange={handleBookChange}
                disabled={editingAccNo !== null}
              />

              <input
                name="author"
                placeholder="Author"
                value={book.author}
                onChange={handleBookChange}
              />

              <input
                name="title"
                placeholder="Title"
                value={book.title}
                onChange={handleBookChange}
              />

              <input
                name="publisher"
                placeholder="Publisher & Place"
                value={book.publisher}
                onChange={handleBookChange}
              />

              <input
                name="year"
                placeholder="Year"
                value={book.year}
                onChange={handleBookChange}
              />

              <input
                name="callNo"
                placeholder="Call No."
                value={book.callNo}
                onChange={handleBookChange}
              />
              <select
  name="bookType"
  value={book.bookType}
  onChange={handleBookChange}
>
  <option value="General">General Book</option>
  <option value="Book Bank">Book Bank Book</option>
</select>

              <select
                name="availability"
                value={book.availability}
                onChange={handleBookChange}
              >
                <option>Available</option>
                <option>Issued</option>
                <option>Lost</option>
                <option>Damaged</option>
              </select>

              <div className="form-group">
  <label>Book Cover</label>

  <input
    type="file"
    accept="image/*"
    onChange={handleCoverImageChange}
  />

  {book.coverImage && (
    <img
      src={book.coverImage}
      alt="cover"
      style={{
        width: "80px",
        height: "110px",
        objectFit: "cover",
        borderRadius: "8px",
        marginTop: "10px",
      }}
    />
  )}
</div>
              <button type="submit">
                {editingAccNo ? "Update Book" : "Save Book"}
              </button>

              {editingAccNo && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={cancelEdit}
                >
                  Cancel Edit
                </button>
              )}
            </form>

            <div className="upload-box">
              <label className="file-upload">
                <b>Upload Excel File</b>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleBookExcelUpload}
                />
              </label>
            </div>

            <h2 style={{ marginTop: "25px" }}>Library Books</h2>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "15px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Search by Accession No., Title or Author"
                value={catalogueSearch}
                onChange={(e) => setCatalogueSearch(e.target.value)}
                style={{ flex: "1", minWidth: "280px" }}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: "180px" }}
              >
                <option>All</option>
                <option>Available</option>
                <option>Issued</option>
                <option>Lost</option>
                <option>Damaged</option>
              </select>

              <select
  value={bookTypeFilter}
  onChange={(e) => setBookTypeFilter(e.target.value)}
  style={{ width: "180px" }}
>
  <option>All</option>
  <option>General</option>
  <option>Book Bank</option>
</select>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="edit-btn"
                  onClick={printSelectedLabels}
                >
                  🖨️ Print Selected Labels
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={deleteSelectedBooks}
                >
                  🗑️ Delete Selected
                </button>
              </div>

              <div>
                Selected: <b>{selectedBooks.length}</b>
              </div>
            </div>

            <div className="catalog-table-wrapper">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          currentCatalogueBooks.length > 0 &&
                          currentCatalogueBooks.every((b) =>
                            selectedBooks.includes(b.accNo)
                          )
                        }
                        onChange={(e) => {
                          const currentIds = currentCatalogueBooks.map(
                            (b) => b.accNo
                          );

                          if (e.target.checked) {
                            setSelectedBooks([
                              ...new Set([...selectedBooks, ...currentIds]),
                            ]);
                          } else {
                            setSelectedBooks(
                              selectedBooks.filter(
                                (id) => !currentIds.includes(id)
                              )
                            );
                          }
                        }}
                      />
                    </th>
                    <th>Accession No.</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Publisher</th>
                    <th>Year</th>
                    <th>Call No.</th>
                    <th>Status</th>
                    <th>Barcode</th>
                    <th>Action</th>
                    <th>Type</th>
                  </tr>
                </thead>

                <tbody>
                  {currentCatalogueBooks.map((b) => (
                    <tr key={b._id || b.accNo}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedBooks.includes(b.accNo)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBooks([...selectedBooks, b.accNo]);
                            } else {
                              setSelectedBooks(
                                selectedBooks.filter((id) => id !== b.accNo)
                              );
                            }
                          }}
                        />
                      </td>

                      <td>{b.accNo}</td>
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.publisher}</td>
                      <td>{b.year}</td>
                      <td>{b.callNo}</td>
                      <td>{b.bookType}</td>

                      <td>
                        <span
                          className="status-badge clickable-status"
                          onClick={() => {
                            const availability =
                              b.availability || b.status || "Available";
                            if (availability.toString() === "Issued") {
                              showIssuedInfo(b.accNo);
                            }
                          }}
                        >
                          {b.availability || b.status || "Available"}
                        </span>
                      </td>

                      <td className="barcode-cell">
                        <div className="barcode-box">
                          <Barcode
                            value={b.accNo?.toString() || "0"}
                            width={0.5}
                            height={22}
                            fontSize={7}
                            margin={0}
                          />
                        </div>
                      </td>

                      <td className="action-cell">
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="edit-btn"
                            title="Edit Book"
                            onClick={() => editBook(b)}
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            className="edit-btn"
                            title="Print Label"
                            onClick={() => printSingleLabel(b)}
                          >
                            🖨️
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            title="Delete Book"
                            onClick={() => deleteBook(b._id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                disabled={cataloguePage === 1}
                onClick={() => setCataloguePage(cataloguePage - 1)}
              >
                Previous
              </button>

              <span>
                Page {cataloguePage} of {totalCataloguePages}
              </span>

              <input
                type="number"
                min="1"
                max={totalCataloguePages}
                placeholder="Go to"
                className="page-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const page = Number(e.target.value);
                    if (page >= 1 && page <= totalCataloguePages) {
                      setCataloguePage(page);
                    }
                  }
                }}
              />

              <button
                disabled={cataloguePage === totalCataloguePages}
                onClick={() => setCataloguePage(cataloguePage + 1)}
              >
                Next
              </button>
            </div>
          </section>
        )}

        {activeSection === "circulation" && (
          <Circulation books={books} setBooks={setBooks} students={students} />
        )}

        {activeSection === "members" && (
          <Students students={students} setStudents={setStudents} />
        )}

        {activeSection === "reports" && (
          <Reports books={books} students={students} />
        )}

        {activeSection === "backup" && (
          <Backup
            books={books}
            setBooks={setBooks}
            students={students}
            setStudents={setStudents}
          />
        )}
        {activeSection === "librarycards" && (
  <LibraryCards students={students} />
)}
        {activeSection === "nodues" && <NoDues />}

        {activeSection === "settings" && <Settings />}

        {activeSection === "opac" && (
          <section className="section-card">
            <h2>Web-OPAC</h2>

            <div className="form-box">
  <input placeholder="Accession No." value={opacAccNo} onChange={(e) => setOpacAccNo(e.target.value)} />
  <input placeholder="Title" value={opacTitle} onChange={(e) => setOpacTitle(e.target.value)} />
  <input placeholder="Author" value={opacAuthor} onChange={(e) => setOpacAuthor(e.target.value)} />
  <input placeholder="Publisher" value={opacPublisher} onChange={(e) => setOpacPublisher(e.target.value)} />
  <input placeholder="Call No." value={opacCallNo} onChange={(e) => setOpacCallNo(e.target.value)} />

  <select value={opacStatus} onChange={(e) => setOpacStatus(e.target.value)}>
    <option>All</option>
    <option>Available</option>
    <option>Issued</option>
    <option>Lost</option>
    <option>Damaged</option>
  </select>
</div>

            <div className="stats-grid" style={{ marginBottom: "15px" }}>
  <div className="stat-card blue">
    <div>
      <h3>General Books</h3>
      <h1>
        {
          books.filter((b) => (b.bookType || "General") === "General")
            .length
        }
      </h1>
    </div>
  </div>

  <div className="stat-card green">
    <div>
      <h3>Book Bank Books</h3>
      <h1>
        {
          books.filter((b) => (b.bookType || "General") === "Book Bank")
            .length
        }
      </h1>
    </div>
  </div>
</div>
            <table>
              <thead>
                <tr>
                  <th>Accession No.</th>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Publisher</th>
                  <th>Call No.</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
  {filteredOpacBooks.map((b) => (
                  <tr key={b._id || b.accNo}>
                    <td>{b.accNo}</td>
                    <td>
  {b.coverImage ? (
    <img
      src={b.coverImage}
      alt="cover"
      style={{
        width: "50px",
        height: "70px",
        objectFit: "cover",
        borderRadius: "6px",
      }}
    />
  ) : (
    "—"
  )}
</td>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.publisher}</td>
                    <td>{b.callNo}</td>
                    <td>
                      <span
                        className="status-badge clickable-status"
                        onClick={() => {
                          const availability =
                            b.availability || b.status || "Available";
                          if (availability.toString() === "Issued") {
                            showIssuedInfo(b.accNo);
                          }
                        }}
                      >
                        {b.availability || b.status || "Available"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
