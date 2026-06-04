import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Students({ students, setStudents }) {
  const emptyStudent = {
    memberType: "Student",
    name: "",
    className: "",
    rollNo: "",
    registrationNo: "",
    mobile: "",
    fatherName: "",
    dob: "",
    bloodGroup: "",
    address: "",
    validity: "",
    photo: "",
  };

  const [student, setStudent] = useState(emptyStudent);
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);

  const loadMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/members`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      alert("Error loading members");
    }
  };

  const loadIssues = async () => {
    try {
      const res = await fetch(`${API_URL}/api/issues`);
      const data = await res.json();
      setIssuedBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setIssuedBooks([]);
    }
  };

  useEffect(() => {
    loadMembers();
    loadIssues();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setStudent({
        ...student,
        photo: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  const saveStudent = async (e) => {
    e.preventDefault();

    if (!student.name) {
      alert("Member name is required");
      return;
    }

    try {
      if (editId) {
        const res = await fetch(`${API_URL}/api/members/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(student),
        });

        const updatedMember = await res.json();

        if (!res.ok) {
          alert(updatedMember.message || "Member update failed");
          return;
        }

        setStudents(
          students.map((s) => (s._id === editId ? updatedMember : s))
        );

        setEditId(null);
        alert("Member updated successfully");
      } else {
        const res = await fetch(`${API_URL}/api/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(student),
        });

        const newMember = await res.json();

        if (!res.ok) {
          alert(newMember.message || "Member save failed");
          return;
        }

        setStudents([newMember, ...students]);
        alert("Member saved successfully");
      }

      setStudent(emptyStudent);
    } catch (error) {
      console.log(error);
      alert("Backend error while saving member");
    }
  };

  const editStudent = (member) => {
    setStudent({
      memberType: member.memberType || "Student",
      name: member.name || "",
      className: member.className || "",
      rollNo: member.rollNo || "",
      registrationNo: member.registrationNo || "",
      mobile: member.mobile || "",
      fatherName: member.fatherName || "",
      dob: member.dob || "",
      bloodGroup: member.bloodGroup || "",
      address: member.address || "",
      validity: member.validity || "",
      photo: member.photo || "",
    });

    setEditId(member._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteStudent = async (memberId) => {
    if (!window.confirm("Delete this member?")) return;

    try {
      const res = await fetch(`${API_URL}/api/members/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Delete failed");
        return;
      }

      setStudents(students.filter((s) => s._id !== memberId));
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
      alert("Member deleted successfully");
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  const deleteSelectedMembers = async () => {
    if (selectedMembers.length === 0) {
      alert("Select members first");
      return;
    }

    if (!window.confirm(`Delete ${selectedMembers.length} selected members?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedMembers.map((id) =>
          fetch(`${API_URL}/api/members/${id}`, {
            method: "DELETE",
          })
        )
      );

      setStudents(students.filter((s) => !selectedMembers.includes(s._id)));
      setSelectedMembers([]);
      alert("Selected members deleted successfully");
    } catch (error) {
      console.log(error);
      alert("Selected delete failed");
    }
  };

  const getStudentHistory = (s) => {
    return issuedBooks.filter(
      (book) =>
        book.rollNo?.toString().toLowerCase() ===
          s.rollNo?.toString().toLowerCase() ||
        book.registrationNo?.toString().toLowerCase() ===
          s.registrationNo?.toString().toLowerCase()
    );
  };

  const handleStudentExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const newStudents = excelData.map((row) => ({
          memberType: row["Member Type"] || row["Type"] || "Student",
          name:
            row["Student Name"] ||
            row["Teacher Name"] ||
            row["Name"] ||
            "",
          className:
            row["Class"] ||
            row["Course"] ||
            row["Department"] ||
            "",
          rollNo:
            row["Roll No."] ||
            row["Roll No"] ||
            row["Teacher ID"] ||
            row["ID"] ||
            "",
          registrationNo:
            row["Registration Number"] ||
            row["Registration No."] ||
            row["Registration No"] ||
            row["Employee No"] ||
            "",
          mobile:
            row["Mobile No."] ||
            row["Mobile No"] ||
            row["Mobile"] ||
            row["Phone"] ||
            "",
          fatherName:
            row["Father Name"] ||
            row["F.Name"] ||
            row["FNAME"] ||
            "",
          dob: row["DOB"] || row["Date of Birth"] || "",
          bloodGroup:
            row["Blood Group"] ||
            row["Blood G."] ||
            row["Blood"] ||
            "",
          address: row["Address"] || "",
          validity: row["Validity"] || row["Valid Till"] || "",
          photo: "",
        }));

        const validStudents = newStudents.filter((s) => s.name);

        for (const member of validStudents) {
          await fetch(`${API_URL}/api/members`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(member),
          });
        }

        await loadMembers();
        setSelectedMembers([]);
        alert(`${validStudents.length} members uploaded successfully`);
      } catch (error) {
        console.log(error);
        alert("Excel upload failed.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const filteredStudents = students.filter((s) => {
    const text = searchText.toLowerCase();

    return (
      (s.memberType || "").toLowerCase().includes(text) ||
      (s.name || "").toLowerCase().includes(text) ||
      (s.className || "").toLowerCase().includes(text) ||
      (s.rollNo || "").toLowerCase().includes(text) ||
      (s.registrationNo || "").toLowerCase().includes(text) ||
      (s.fatherName || "").toLowerCase().includes(text) ||
      (s.mobile || "").toLowerCase().includes(text)
    );
  });

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedMembers.includes(s._id));

  const toggleSelectAll = (e) => {
    const filteredIds = filteredStudents.map((s) => s._id);

    if (e.target.checked) {
      setSelectedMembers([...new Set([...selectedMembers, ...filteredIds])]);
    } else {
      setSelectedMembers(
        selectedMembers.filter((id) => !filteredIds.includes(id))
      );
    }
  };

  const toggleSingleMember = (memberId, checked) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    }
  };

  return (
    <section className="section-card">
      <h2>Members Management</h2>

      <form className="form-box" onSubmit={saveStudent}>
        <select
          name="memberType"
          value={student.memberType}
          onChange={handleChange}
        >
          <option>Student</option>
          <option>Teacher</option>
        </select>

        <input
          name="name"
          placeholder="Member Name"
          value={student.name}
          onChange={handleChange}
        />

        <input
          name="className"
          placeholder="Class / Department"
          value={student.className}
          onChange={handleChange}
        />

        <input
          name="rollNo"
          placeholder="Roll No. / Teacher ID"
          value={student.rollNo}
          onChange={handleChange}
        />

        <input
          name="registrationNo"
          placeholder="Registration No. / Employee No."
          value={student.registrationNo}
          onChange={handleChange}
        />

        <input
          name="fatherName"
          placeholder="Father Name"
          value={student.fatherName}
          onChange={handleChange}
        />

        <input
          name="dob"
          placeholder="DOB"
          value={student.dob}
          onChange={handleChange}
        />

        <input
          name="bloodGroup"
          placeholder="Blood Group"
          value={student.bloodGroup}
          onChange={handleChange}
        />

        <input
          name="mobile"
          placeholder="Mobile / Phone No."
          value={student.mobile}
          onChange={handleChange}
        />

        <input
          name="validity"
          placeholder="Validity e.g. 2025-2027"
          value={student.validity}
          onChange={handleChange}
        />

        <input
          name="address"
          placeholder="Address"
          value={student.address}
          onChange={handleChange}
        />

        <div>
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />

          {student.photo && (
            <img
              src={student.photo}
              alt="member"
              style={{
                width: "60px",
                height: "70px",
                objectFit: "cover",
                borderRadius: "6px",
                marginTop: "8px",
              }}
            />
          )}
        </div>

        <button type="submit">
          {editId ? "Update Member" : "Save Member"}
        </button>
      </form>

      <div className="upload-box">
        <label className="file-upload">
          <b>Upload Members Excel File</b>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleStudentExcelUpload}
          />
        </label>
      </div>

      <input
        className="opac-search"
        placeholder="Search by member type, name, class/department, roll/id, registration no., father name or mobile."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <button
          type="button"
          className="delete-btn"
          onClick={deleteSelectedMembers}
        >
          🗑️ Delete Selected
        </button>

        <div>
          Selected: <b>{selectedMembers.length}</b>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
              />
            </th>
            <th>Member Type</th>
            <th>Name</th>
            <th>Class / Department</th>
            <th>Roll No. / ID</th>
            <th>Registration / Employee No.</th>
            <th>Father Name</th>
            <th>DOB</th>
            <th>Blood Group</th>
            <th>Mobile No.</th>
            <th>Validity</th>
            <th>Total Issued</th>
            <th>Currently Issued</th>
            <th>Returned</th>
            <th>Total Fine</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredStudents.map((s) => {
            const history = getStudentHistory(s);

            const currentIssued = history.filter(
              (item) => item.status === "Issued"
            ).length;

            const returned = history.filter(
              (item) => item.status === "Returned"
            ).length;

            const totalFine = history.reduce(
              (sum, item) => sum + Number(item.fine || 0),
              0
            );

            return (
              <tr key={s._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(s._id)}
                    onChange={(e) =>
                      toggleSingleMember(s._id, e.target.checked)
                    }
                  />
                </td>

                <td>{s.memberType || "Student"}</td>
                <td>{s.name}</td>
                <td>{s.className}</td>
                <td>{s.rollNo}</td>
                <td>{s.registrationNo}</td>
                <td>{s.fatherName}</td>
                <td>{s.dob}</td>
                <td>{s.bloodGroup}</td>
                <td>{s.mobile}</td>
                <td>{s.validity}</td>
                <td>{history.length}</td>
                <td>{currentIssued}</td>
                <td>{returned}</td>
                <td>₹{totalFine}</td>

                <td>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => editStudent(s)}
                      title="Edit Member"
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => deleteStudent(s._id)}
                      title="Delete Member"
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

export default Students;