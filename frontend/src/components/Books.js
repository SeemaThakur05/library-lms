import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    accNo: "",
    title: "",
    author: "",
    publisher: "",
    year: "",
    callNo: "",
    bookType: "General",
    status: "Available",
    availability: "Available",
  });

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/books`);
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      alert("Error loading books");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      accNo: "",
      title: "",
      author: "",
      publisher: "",
      year: "",
      callNo: "",
      bookType: "General",
      status: "Available",
      availability: "Available",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.accNo || !form.title || !form.author) {
      alert("Accession No, Title and Author are required");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/api/books/${editingId}`
        : `${API_URL}/api/books`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");

      await fetchBooks();
      resetForm();
    } catch (error) {
      alert("Error saving book");
    }
  };

  const handleEdit = (book) => {
    setEditingId(book._id);
    setForm({
      accNo: book.accNo || "",
      title: book.title || "",
      author: book.author || "",
      publisher: book.publisher || "",
      year: book.year || "",
      callNo: book.callNo || "",
      bookType: book.bookType || "General",
      status: book.status || "Available",
      availability: book.availability || book.status || "Available",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;

    try {
      await fetch(`${API_URL}/api/books/${id}`, {
        method: "DELETE",
      });
      fetchBooks();
    } catch (error) {
      alert("Error deleting book");
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const formattedBooks = rows.map((row) => ({
          accNo: String(
            row.accNo ||
              row["Accession No"] ||
              row["Acc No"] ||
              row["Accession"] ||
              ""
          ).trim(),
          title: row.title || row["Title"] || "",
          author: row.author || row["Author"] || "",
          publisher: row.publisher || row["Publisher"] || "",
          year: String(row.year || row["Year"] || ""),
          callNo: row.callNo || row["Call No"] || row["Call Number"] || "",
          bookType: row.bookType || row["Book Type"] || "General",
          status: row.status || row["Status"] || "Available",
          availability: row.availability || row["Availability"] || "Available",
        }));

        const validBooks = formattedBooks.filter((b) => b.accNo);

        const res = await fetch(`${API_URL}/api/books/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ books: validBooks }),
        });

        const result = await res.json();
        alert(`Inserted: ${result.inserted}, Skipped: ${result.skipped}`);
        fetchBooks();
      } catch (error) {
        alert("Excel upload failed");
      }
    };

    reader.readAsBinaryString(file);
  };

  const filteredBooks = books.filter((book) => {
    const text = `${book.accNo} ${book.title} ${book.author} ${book.publisher} ${book.callNo}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <h2>Cataloguing / Books</h2>

      <form onSubmit={handleSubmit} className="form-grid">
        <input name="accNo" placeholder="Accession No" value={form.accNo} onChange={handleChange} />
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        <input name="author" placeholder="Author" value={form.author} onChange={handleChange} />
        <input name="publisher" placeholder="Publisher" value={form.publisher} onChange={handleChange} />
        <input name="year" placeholder="Year" value={form.year} onChange={handleChange} />
        <input name="callNo" placeholder="Call No" value={form.callNo} onChange={handleChange} />

        <select name="bookType" value={form.bookType} onChange={handleChange}>
          <option>General</option>
          <option>Book Bank</option>
        </select>

        <select name="availability" value={form.availability} onChange={handleChange}>
          <option>Available</option>
          <option>Issued</option>
          <option>Lost</option>
          <option>Damaged</option>
        </select>

        <button type="submit">{editingId ? "Update Book" : "Add Book"}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <div style={{ marginTop: "15px", marginBottom: "15px" }}>
        <input
          placeholder="Search by Accession No, Title, Author, Publisher, Call No"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "60%", padding: "8px" }}
        />

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleExcelUpload}
          style={{ marginLeft: "10px" }}
        />
      </div>

      <h3>Total Books: {books.length}</h3>

      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Acc No</th>
            <th>Title</th>
            <th>Author</th>
            <th>Publisher</th>
            <th>Year</th>
            <th>Call No</th>
            <th>Type</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredBooks.slice(0, 50).map((book) => (
            <tr key={book._id}>
              <td>{book.accNo}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.publisher}</td>
              <td>{book.year}</td>
              <td>{book.callNo}</td>
              <td>{book.bookType || "General"}</td>
              <td>{book.availability || book.status}</td>
              <td>
                <button onClick={() => handleEdit(book)}>Edit</button>{" "}
                <button onClick={() => handleDelete(book._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Showing first 50 matching records.</p>
    </div>
  );
}

export default Books;