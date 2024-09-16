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

function CalendarTwo() {
  const [Calendar, setCalendar] = useState([]);
  const [editingCalendar, setEditingCalendar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatedCalendar, setUpdatedCalendar] = useState({
    startdate: "",
    count: "",
    enddate: "",
    serviceid: "",
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    const getCalendar = async () => {
      try {
        const db = getFirestore();
        const CalendarCollection = await getDocs(collection(db, "calendar2"));
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
      startdate: "",
      count: "",
      enddate: "",
      serviceid: "",
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: "",
    });
  };

  const handleDelete = async (countToDelete) => {
    try {
      const db = getFirestore();
      const calendarToDelete = Calendar.find((calendar) => calendar.count === countToDelete);
      if (calendarToDelete) {
        await deleteDoc(doc(db, "calendar2", calendarToDelete.id));
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
      const calendarRef = doc(db, "calendar2", editingCalendar.id);
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
          await deleteDoc(doc(db, "calendar2", calendarToDelete.id));
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

  const paginatedStops = Calendar.slice(
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
              <h5 className="text-uppercase p-2 page-title">Calendar_02 Data</h5>
            </div>
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
                <th>Count</th>
                <th>Start_Date</th>
                <th>End Date</th>
                <th>Service_Id</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
                <th>Sunday</th>
                <th>Modify</th>
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
                  <td className="text-secondary">
                    <b>{calendar.count}</b>
                  </td>
                  <td>{calendar.startdate}</td>
                  <td>{calendar.enddate}</td>
                  <td>{calendar.serviceid}</td>
                  <td>{calendar.monday}</td>
                  <td>{calendar.tuesday}</td>
                  <td>{calendar.wednesday}</td>
                  <td>{calendar.thursday}</td>
                  <td>{calendar.friday}</td>
                  <td>{calendar.saturday}</td>
                  <td>{calendar.sunday}</td>
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
                {currentPage < Math.ceil(Calendar.length / pageSize) && (
                  <Pagination.Item
                    onClick={() => handlePaginationClick(currentPage + 1)}
                  >
                    {currentPage + 1}
                  </Pagination.Item>
                )}
                <Pagination.Next
                  onClick={() => handlePaginationClick(currentPage + 1)}
                  disabled={currentPage === Math.ceil(Calendar.length / pageSize)}
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
        large
        backdrop="static"
        className="editinfo_modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Calendar Dates</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row className="gap-3">
              <Col>
                <Form.Group>
                  <Form.Label>New Starting Date</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedCalendar.startdate}
                    onChange={(e) =>
                      setUpdatedCalendar({
                        ...updatedCalendar,
                        startdate: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Ending Date</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedCalendar.enddate}
                    onChange={(e) =>
                      setUpdatedCalendar({
                        ...updatedCalendar,
                        enddate: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Service ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedCalendar.serviceid}
                    onChange={(e) =>
                      setUpdatedCalendar({
                        ...updatedCalendar,
                        serviceid: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>New Monday ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedCalendar.monday}
                    onChange={(e) =>
                      setUpdatedCalendar({
                        ...updatedCalendar,
                        monday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Tuesday ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedCalendar.tuesday}
                    onChange={(e) =>
                      setUpdatedCalendar({
                        ...updatedCalendar,
                        tuesday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Wednesday ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedCalendar.wednesday}
                    onChange={(e) =>
                      setUpdatedCalendar({
                        ...updatedCalendar,
                        wednesday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>New Saturday ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedCalendar.saturday}
                    onChange={(e) =>
                      setUpdatedCalendar({
                        ...updatedCalendar,
                        saturday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Sunday ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedCalendar.sunday}
                    onChange={(e) =>
                      setUpdatedCalendar({
                        ...updatedCalendar,
                        sunday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
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

export default CalendarTwo;
