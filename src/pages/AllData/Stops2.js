import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  Table,
  Button,
  Form,
  Container,
  Row,
  Col,
  Modal,
  Pagination,
} from "react-bootstrap/";
import { db } from "../../Config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Stops2() {
  const [stops, setStops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editedStop, setEditedStop] = useState(null);
  const [updatedStopInfo, setUpdatedStopInfo] = useState({
    count: "",
    stop_id: "",
    stop_lat: "",
    stop_lon: "",
    stop_name: "",
    zone_id: "",
  });
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);


  useEffect(() => {
    const getStops = async () => {
      try {
        const db = getFirestore();
        const stopsCollection = await getDocs(collection(db, "stops2"));
        const stopsData = stopsCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isSelected: false,
        }));
        setStops(stopsData);
      } catch (error) {
        console.error("Error fetching stops:", error);
      }
    };

    getStops();
  }, []);

  const handleEdit = (stop) => {
    setEditedStop(stop);
    setShowModal(true);
    setUpdatedStopInfo(stop);
  };

  const handleCloseModal = () => {
    setEditedStop(null);
    setShowModal(false);
    setUpdatedStopInfo({
      count: "",
      stop_id: "",
      stop_lat: "",
      stop_lon: "",
      stop_name: "",
      zone_id: "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      const db = getFirestore();
      const stopRef = doc(db, "stops2", editedStop.id);
      await updateDoc(stopRef, updatedStopInfo);
      const updatedStops = stops.map((stop) =>
        stop.id === editedStop.id ? { ...stop, ...updatedStopInfo } : stop
      );
      setStops(updatedStops);
      handleCloseModal();
      toast.success("Stop updated successfully");
    } catch (error) {
      toast.error("Error while updating stop:", error);
      console.error("Error while updating stop:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "stops2", id));
      setStops((prevStops) => prevStops.filter((stop) => stop.id !== id));
      toast.success("Stop deleted successfully");
    } catch (error) {
      console.error("Error deleting stop:", error);
      toast.error("Error deleting stop");
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
    try {
      const db = getFirestore();
  
      for (const rowId of selectedStops) {
        const stopToDelete = stops.find((stop) => stop.id === rowId);
        if (stopToDelete) {
          await deleteDoc(doc(db, "stops2", stopToDelete.id));
        } else {
          console.error("Stop with id", rowId, "not found.");
        }
      }
  
      setStops((prevStops) =>
        prevStops.filter((stop) => !selectedStops.includes(stop.id))
      );
      setSelectedStops([]);
      setSelectAll(false);
      toast.success("Selected stops deleted successfully");
    } catch (error) {
      console.error("Error deleting selected stops:", error);
      toast.error("Error deleting selected stops");
    }
  };


  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const paginatedStops = stops.slice(
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
              <h5 className="text-uppercase p-2 page-title">Stops_2 Data</h5>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Button
              variant="danger"
              className="mb-3"
              onClick={handleDeleteSelected}
              disabled={selectedStops.length === 0}
            >
              Delete Selected
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
                  <th>Count</th>
                  <th>Stop Id</th>
                  <th>Stop Lat</th>
                  <th>Stop Lon</th>
                  <th>Stop Name</th>
                  <th>Zone Id</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStops.map((stop) => (
                  <tr key={stop.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={stop.isSelected}
                        onChange={() => handleSelectStop(stop.id)}
                      />
                    </td>
                    <td className="text-secondary">
                      <b>{stop.count}</b>
                    </td>
                    <td>{stop.stop_id}</td>
                    <td>{stop.stop_lat}</td>
                    <td>{stop.stop_lon}</td>
                    <td>{stop.stop_name}</td>
                    <td>{stop.zone_id}</td>
                    <td className="d-flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleEdit(stop)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(stop.id)}
                      >
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
                {currentPage < Math.ceil(stops.length / pageSize) && (
                  <Pagination.Item
                    onClick={() => handlePaginationClick(currentPage + 1)}
                  >
                    {currentPage + 1}
                  </Pagination.Item>
                )}
                <Pagination.Next
                  onClick={() => handlePaginationClick(currentPage + 1)}
                  disabled={currentPage === Math.ceil(stops.length / pageSize)}
                />
              </Pagination>
            </div>
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
          <Modal.Title>Edit Stop Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row className="gap-3">
              <Col>
                <Form.Group>
                  <Form.Label>New Count</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.count}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        count: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Stop Id</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.stop_id}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        stop_id: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Stop Lat</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.stop_lat}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        stop_lat: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>New Stop Lon</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.stop_lon}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        stop_lon: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Stop Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.stop_name}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        stop_name: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Zone Id</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.zone_id}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        zone_id: e.target.value,
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

export default Stops2;
