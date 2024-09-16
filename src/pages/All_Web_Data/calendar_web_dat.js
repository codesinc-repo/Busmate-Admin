import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { Table, Button, Modal, Form, Container, Col, Row, Pagination } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import {  FaDeleteLeft } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../../Config";
import SearchFilter from "../../components/SearchFilter";
import Loader from "../../components/Loader";

export function CalendarWeb() {
  const [stops, setStops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editedStop, setEditedStop] = useState(null);
  const [updatedStopInfo, setUpdatedStopInfo] = useState({
    start_date: "",
    end_date: "",
    service_id: "",
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  });
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getStops();
  }, [currentPage]);

  const getStops = async () => {
    try {
      setIsLoading(true);
      const db = getFirestore();
      const pageSize = 50;
      const startIndex = (currentPage - 1) * pageSize;
      const stopsQuery = query(collection(db, "calendar-web-data"), orderBy("start_date"), limit(pageSize), startAfter(startIndex));

      const stopsCollection = await getDocs(stopsQuery);
      const stopsData = stopsCollection.docs.map((doc) => {
        const data = doc.data();
        const cleanedData = {};
        for (const key in data) {
          if (typeof data[key] === "string") {
            cleanedData[key] = data[key].replace(/"/g, "");
          } else {
            cleanedData[key] = data[key];
          }
        }
        return {
          id: doc.id,
          ...cleanedData,
          selected: false,
        };
      });

      setStops(stopsData);
      setTotalPages(Math.ceil(stopsData.length / pageSize));
      
      console.log("Data fetched successfully");
    } catch (error) {
      console.error("Error fetching stops:", error);
      toast.error("Error fetching stops");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (stop) => {
    setEditedStop(stop);
    setShowModal(true);
    setUpdatedStopInfo(stop);
  };

  const handleCloseModal = () => {
    setEditedStop(null);
    setShowModal(false);
    setUpdatedStopInfo({
      start_date: "",
      end_date: "",
      service_id: "",
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      const stopRef = doc(db, "calendar-web-data", editedStop.id);
      await updateDoc(stopRef, updatedStopInfo);
      const updatedStops = stops.map((stop) =>
        stop.id === editedStop.id ? { ...stop, ...updatedStopInfo } : stop
      );
      setStops(updatedStops);
      handleCloseModal();
      toast.success("Calendar updated successfully");
    } catch (error) {
      toast.error("Error while updating stop:", error);
      console.error("Error while updating stop:", error);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true)
    try {
      await deleteDoc(doc(db, "calendar-web-data", id));
      setStops((prevStops) => prevStops.filter((stop) => stop.id !== id));
      toast.success("Stop deleted successfully");
    } catch (error) {
      console.error("Error deleting stop:", error);
      toast.error("Error deleting stop");
    }finally{
      setIsLoading(false)
    }
  };

  const handleSelectStop = (id) => {
    const updatedStops = stops.map((stop) =>
      stop.id === id ? { ...stop, isSelected: !stop.isSelected } : stop
    );
    setStops(updatedStops);
    setSelectedStops(updatedStops.filter((stop) => stop.isSelected));
    setSelectAll(updatedStops.every((stop) => stop.isSelected));
  };

  const handleSelectAll = () => {
    const updatedStops = stops.map((stop) => ({ ...stop, isSelected: !selectAll }));
    setStops(updatedStops);
    setSelectedStops(updatedStops.filter((stop) => stop.isSelected));
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    setIsLoading(true)
    try {
      for (const stop of selectedStops) {
        await deleteDoc(doc(db, "calendar-web-data", stop.id));
      }
      setStops((prevStops) =>
        prevStops.filter((stop) => !selectedStops.includes(stop))
      );
      setSelectedStops([]);
      setSelectAll(false);
      toast.success("Selected stops deleted successfully");
    } catch (error) {
      console.error("Error deleting selected stops:", error);
      toast.error("Error deleting selected stops");
    }finally{
      setIsLoading(false)
    }
  };

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const filteredAppData = stops.filter((stop) => {
    const searchTermLower = searchTerm.toLowerCase();
    return ['start_date', 'end_date', 'service_id'].some((field) =>
      stop[field]
        ? stop[field].toLowerCase().includes(searchTermLower)
        : false
    );
  });

  const paginatedStops = filteredAppData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <ToastContainer />
      <Container fluid>
        <Row>
          <Col lg={12} className="p-3">
            <div className="text-center">
              <h5 className="text-uppercase p-2 page-title">Calendar Mobile Data</h5>
            </div>
            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              field={['start_date', 'end_date', 'service_id']}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Button
              variant="danger"
              className="mb-3"
              onClick={handleDeleteSelected}
              disabled={isLoading || selectedStops.length === 0} // Disable button when isLoading is true or no shapes are selected

            >
             {isLoading ? "Deleting..." : "Delete Selected"}
            </Button>
            <Button
              variant="primary"
              className="mb-3 ms-3"
              onClick={handleSelectAll}
            >
              {selectAll ? "Unselect All" : "Select All"}
            </Button>
            <Table striped bordered hover className="overflow-scroll">
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Start_Date</th>
                  <th>End_Date</th>
                  <th>Service ID</th>
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
              {isLoading ? (
                <tr>
                  <td colSpan={12}  className="text-center">
                  <Loader />
                  </td>
                </tr>
                ) 
            : ( paginatedStops.map((stop, index) => (
              <tr key={index}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={stop.isSelected}
                    onChange={() => handleSelectStop(stop.id)}
                  />
                </td>
                <td>{stop.start_date}</td>
                <td>{stop.end_date}</td>
                <td>{stop.service_id}</td>
                <td>{stop.monday}</td>
                <td>{stop.tuesday}</td>
                <td>{stop.wednesday}</td>
                <td>{stop.thursday}</td>
                <td>{stop.friday}</td>
                <td>{stop.saturday}</td>
                <td>{stop.sunday}</td>
                <td className="d-flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleEdit(stop)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(stop.id)}
                  >
                    <FaDeleteLeft />
                  </Button>
                </td>
              </tr>
            )))}
              </tbody>
            </Table>
            <Col lg={12}>
            {/* Pagination */}
            <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                onClick={() => handlePaginationClick(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {currentPage > 1 && (
                <Pagination.Item onClick={() => handlePaginationClick(currentPage - 1)}>
                  {currentPage - 1}
                </Pagination.Item>
              )}
              <Pagination.Item active>{currentPage}</Pagination.Item>
              {currentPage < Math.ceil(filteredAppData.length / pageSize) && (
                <Pagination.Item onClick={() => handlePaginationClick(currentPage + 1)}>
                  {currentPage + 1}
                </Pagination.Item>
              )}
              <Pagination.Next
                onClick={() => handlePaginationClick(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredAppData.length / pageSize)}
              />
            </Pagination>
          </div>
          </Col>
          </Col>
        </Row>
      </Container>

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
          <Modal.Title>Edit Calendar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row className="gap-3">
              <Col>
                <Form.Group>
                  <Form.Label>Start_Date</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.start_date}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        start_date: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>End_Date</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.end_date}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        end_date: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Service ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.service_id}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        service_id: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Monday</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.monday}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        monday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Tuesday</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.tuesday}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        tuesday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
              
                <Form.Group>
                  <Form.Label>Wednesday</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.wednesday}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        wednesday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Thursday</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.thursday}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        thursday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Friday</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.friday}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        friday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Saturday</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.saturday}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        saturday: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Sunday</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.sunday}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
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


