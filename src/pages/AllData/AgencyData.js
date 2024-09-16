import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  startAfter,
  endBefore,
  limit,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Col,
  Container,
  Row,
  Modal,
  Form,
  Button,
  Table,
  Pagination,
  Spinner,
} from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
import Loader from "../../components/Loader";

function CalendarDates() {
  const [calendar, setCalendar] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState(null);
  const [updatedCalendarInfo, setUpdatedCalendarInfo] = useState({
    date: "",
    exception_type: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDate, setSearchDate] = useState("");
  const [searchExceptionType, setSearchExceptionType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCalendar();
  }, []);

  const handleSearch = () => {
    const filteredCalendar = calendar.filter((item) => {
      return (
        item.date.toLowerCase().includes(searchDate.toLowerCase()) &&
        item.exception_type
          .toLowerCase()
          .includes(searchExceptionType.toLowerCase())
      );
    });
    setCalendar(filteredCalendar);
  };

  const handleClearSearch = () => {
    setSearchDate("");
    setSearchExceptionType("");
    getCalendar();
  };

  const getCalendar = async (next = false, previous = false) => {
    try {
      setLoading(true);
      const db = getFirestore();
      let calendarQuery = query(
        collection(db, "agency2"),
        orderBy("date"),
        limit(50)
      );

      if (next && lastVisible) {
        calendarQuery = query(
          collection(db, "agency2"),
          orderBy("date"),
          startAfter(lastVisible),
          limit(50)
        );
      } else if (previous && firstVisible) {
        calendarQuery = query(
          collection(db, "agency2"),
          orderBy("date"),
          endBefore(firstVisible),
          limit(50)
        );
      }

      const calendarCollection = await getDocs(calendarQuery);
      const calendarData = calendarCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCalendar(calendarData);
      setFirstVisible(calendarCollection.docs[0]);
      setLastVisible(calendarCollection.docs[calendarCollection.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching calendar:", error);
      toast.error("Error fetching calendar data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (calendarItem) => {
    setEditingCalendar(calendarItem);
    setUpdatedCalendarInfo({
      date: calendarItem.date,
      exception_type: calendarItem.exception_type,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCalendar(null);
    setUpdatedCalendarInfo({
      date: "",
      exception_type: "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      const db = getFirestore();
      const calendarRef = doc(db, "agency2", editingCalendar.id);
      await updateDoc(calendarRef, updatedCalendarInfo);
      const updatedCalendars = calendar.map((calendarItem) =>
        calendarItem.id === editingCalendar.id
          ? { ...calendarItem, ...updatedCalendarInfo }
          : calendarItem
      );
      setCalendar(updatedCalendars);
      handleCloseModal();
      toast.success("Calendar updated successfully");
    } catch (error) {
      console.error("Error updating calendar:", error);
      toast.error("Error updating calendar");
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      const db = getFirestore();
      await deleteDoc(doc(db, "agency2", id));
      setCalendar((prevCalendar) =>
        prevCalendar.filter((calendarItem) => calendarItem.id !== id)
      );
      toast.success("Calendar deleted successfully");
    } catch (error) {
      console.error("Error deleting calendar:", error);
      toast.error("Error deleting calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRow = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((selectedId) => selectedId !== id)
        : [...prevSelectedRows, id]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      setLoading(true);
      const db = getFirestore();

      for (const id of selectedRows) {
        await deleteDoc(doc(db, "agency2", id));
      }

      setCalendar((prevCalendar) =>
        prevCalendar.filter((calendarItem) => !selectedRows.includes(calendarItem.id))
      );
      toast.success("Selected calendars deleted successfully");
      setSelectedRows([]);
    } catch (error) {
      console.error("Error deleting selected calendars:", error);
      toast.error("Error deleting selected calendars");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    setSelectedRows(calendar.map((calendarItem) => calendarItem.id));
  };

  const handleUnselectAll = () => {
    setSelectedRows([]);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    getCalendar(true, false);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
    getCalendar(false, true);
  };

  return (
    <>
      <ToastContainer />
      <div className="container-fluid px-3 pt-4">
        <div className="row">
          <div className="col-lg-12 p-3">
            <div className="text-center">
              <h5 className="text-uppercase p-2 page-title">Calendar Dates</h5>
            </div>
          </div>
          <div className="col-lg-12 p-3">
            <Button
              variant="danger"
              className="mb-3"
              onClick={handleDeleteSelected}
              disabled={isLoading || selectedRows.length === 0} // Disable button when isLoading is true or no shapes are selected
            >
              {isLoading ? "Deleting..." : "Delete Selected"}
            </Button>
            <Button variant="info" onClick={handleSelectAll} className="ms-2">
              Select All
            </Button>
            <Button variant="info" onClick={handleUnselectAll} className="ms-2">
              Unselect All
            </Button>
          </div>

          <div className="col-lg-8 p-3 d-flex align-items-center">
            <Form.Label className="mr-2">Date:</Form.Label>
            <Form.Control
              type="text"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
            <Button variant="primary" className="ml-2" onClick={handleSearch}>
              Search
            </Button>
            <Button
              variant="secondary"
              className="ml-2"
              onClick={handleClearSearch}
            >
              Clear
            </Button>
          </div>
          <Table striped bordered hover className="overflow-scroll">
            <thead>
              <tr>
                <th>Select</th>
                <th>Date</th>
                <th>Exception Type</th>
                <th>Service Id</th>
                <th>Modify</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <Loader />
                  </td>
                </tr>
              ) : calendar.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    No data available
                  </td>
                </tr>
              ) : (
                calendar.map((calendarItem) => (
                  <tr key={calendarItem.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedRows.includes(calendarItem.id)}
                        onChange={() => handleToggleRow(calendarItem.id)}
                      />
                    </td>
                    <td>{calendarItem.date}</td>
                    <td>{calendarItem.exception_type}</td>
                    <td>{calendarItem.service_id}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(calendarItem)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(calendarItem.id)}
                        className="ml-2"
                      >
                        <FaDeleteLeft />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <Pagination>
            <Pagination.Prev
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            />
            <Pagination.Item active>{currentPage}</Pagination.Item>
            <Pagination.Next
              onClick={handleNextPage}
              disabled={calendar.length < 50}
            />
          </Pagination>
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Calendar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="text"
                value={updatedCalendarInfo.date}
                onChange={(e) =>
                  setUpdatedCalendarInfo({
                    ...updatedCalendarInfo,
                    date: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group controlId="formExceptionType">
              <Form.Label>Exception Type</Form.Label>
              <Form.Control
                type="text"
                value={updatedCalendarInfo.exception_type}
                onChange={(e) =>
                  setUpdatedCalendarInfo({
                    ...updatedCalendarInfo,
                    exception_type: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CalendarDates;
