import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Table, Form, Container, Col, Row, Modal, Button,Pagination } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchFilter from "../../components/SearchFilter";

export function CalendarAttributesWeb() {
  const [Calendar, setCalendar] = useState([]);
  const [editingCalendar, setEditingCalendar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatedCalendar, setUpdatedCalendar] = useState({
    service_id: "",
    service_description: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getCalendar = async () => {
      try {
        const db = getFirestore();
        const CalendarCollection = await getDocs(collection(db, "calendar_attributes-web-data"));
        const CalendarData = CalendarCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCalendar(CalendarData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getCalendar();
  }, []);

  const handleEdit = (calendar) => {
    setEditingCalendar(calendar);
    setUpdatedCalendar(calendar);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingCalendar(null);
    setShowModal(false);
    setUpdatedCalendar({
        service_id: "",
        service_description: "",
       
    });
  };

  const handleDelete = async (countToDelete) => {
    try {
      const db = getFirestore();
      const calendarToDelete = Calendar.find((calendar) => calendar.count === countToDelete);
      if (calendarToDelete) {
        await deleteDoc(doc(db, "calendar_attributes-web-data", calendarToDelete.id));
        setCalendar((prevCalendar) =>
          prevCalendar.filter((calendar) => calendar.count !== countToDelete)
        );
        console.log("Calendar deleted successfully:", calendarToDelete);
      } else {
        console.error("Calendar with count", countToDelete, "not found.");
      }
    } catch (error) {
      console.error("Error deleting calendar:", error);
    }
  };

  const handleSaveChanges = async () => {
    const db = getFirestore();
    try {
      const calendarRef = doc(db, "calendar_attributes-web-data", editingCalendar.id);
      await updateDoc(calendarRef, updatedCalendar);

      const updatedCalendars = Calendar.map((calendar) =>
        calendar.id === editingCalendar.id ? { ...calendar, ...updatedCalendar } : calendar
      );
      setCalendar(updatedCalendars);
      handleCloseModal();
      toast.success("Calendar updated successfully:", editingCalendar);
    } catch (error) {
      toast.error("Error updating calendar:", error);
    }
  };

  const handleToggleRow = (count) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(count)
        ? prevSelectedRows.filter((selectedCount) => selectedCount !== count)
        : [...prevSelectedRows, count]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      const db = getFirestore();

      for (const count of selectedRows) {
        const calendarToDelete = Calendar.find((calendar) => calendar.count === count);
        if (calendarToDelete) {
          await deleteDoc(doc(db, "calendar_attributes-web-data", calendarToDelete.id));
        } else {
          console.error("Calendar with count", count, "not found.");
        }
      }

      setCalendar((prevCalendar) =>
        prevCalendar.filter((calendar) => !selectedRows.includes(calendar.count))
      );
      console.log("Selected calendars deleted successfully:", selectedRows);
      setSelectedRows([]);
    } catch (error) {
      console.error("Error deleting selected calendars:", error);
    }
  };

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const filteredAttributes = Calendar.filter((calendar) => {
    const searchTermLower = searchTerm.toLowerCase();
    return ['Service_Id', 'Service_Description'].some((field) =>
      calendar[field] ? calendar[field].toLowerCase().includes(searchTermLower) : false
    );
  });

  const paginatedStops = filteredAttributes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <ToastContainer />
      <div className="container-fluid px-3 pt-4">
        <div className="row">
          <div className="col-lg-12 p-3">
            <div className="text-center  ">
              <h5 className="text-uppercase p-2 page-title">Calendar Attributes Web Data</h5>
            </div>
            <SearchFilter
             searchTerm={searchTerm}
             setSearchTerm={setSearchTerm}
             fields={['Service_Id', 'Service_Description']}
            />
          </div>
          <div className="col-lg-12 p-3">
            {selectedRows.length > 0 && (
              <Button variant="danger" onClick={handleDeleteSelected}>
                Delete Selected
              </Button>
            )}
          </div>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Select</th>
                <th>Service_Id</th>
                <th>Service_Description</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStops.map((calendar, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(calendar.count)}
                      onChange={() => handleToggleRow(calendar.count)}
                    />
                  </td>
                  <td>{calendar.service_id}</td>
                  <td>{calendar.service_description}</td>
                  <td className="d-flex gap-2">
                    <Button variant="primary" onClick={() => handleEdit(calendar)}>
                      Edit
                    </Button>{" "}
                    <Button variant="danger" onClick={() => handleDelete(calendar.count)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.Prev
                  onClick={() => handlePaginationClick(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {currentPage > 1 && (
                  <Pagination.Item
                    onClick={() => handlePaginationClick(currentPage - 1)}
                  >
                    {currentPage - 1}
                  </Pagination.Item>
                )}
                <Pagination.Item active>{currentPage}</Pagination.Item>
                {currentPage < Math.ceil(filteredAttributes.length / pageSize) && (
                  <Pagination.Item
                    onClick={() => handlePaginationClick(currentPage + 1)}
                  >
                    {currentPage + 1}
                  </Pagination.Item>
                )}
                <Pagination.Next
                  onClick={() => handlePaginationClick(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredAttributes.length / pageSize)}
                />
              </Pagination>
            </div>
        </div>
      </div>
      <Modal
        show={showModal}
        size="lg"
        centered
        onHide={handleCloseModal}
        backdrop="static"
        className="editinfo_modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Route Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row>
              {Object.keys(updatedCalendar).map((key) => (
                <Col key={key} md={6}>
                  <Form.Group>
                    <Form.Label>{key.replace(/_/g, " ")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={updatedCalendar[key]}
                      onChange={(e) =>
                        setUpdatedCalendar({
                          ...updatedCalendar,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>
          </Container>
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

