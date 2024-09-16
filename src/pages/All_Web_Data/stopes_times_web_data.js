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
  Pagination
} from "react-bootstrap/";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchFilter from "../../components/SearchFilter";

function StopsTimeWeb() {
  const [stops, setStops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editedStop, setEditedStop] = useState(null);
  const [updatedStopInfo, setUpdatedStopInfo] = useState({
    stop_id: "",
    arrival_time: "",
    departure_time: "",
    drop_off_type: "",
    pickup_type: "",
    shape_dist_traveled: "",
    stop_headsign: "",
    stop_sequence: "",
    trip_id: "",
  });
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getStops = async () => {
      try {
        const db = getFirestore(); // Initialize Firestore directly here
        const stopsCollection = await getDocs(collection(db, "stop_times-web-data"));
        const stopsData = stopsCollection.docs.map((doc) => {
          const data = doc.data();
          // Remove double quotes from all string properties
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
        toast.success("Data fetched successfully");
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
      stop_id: "",
      arrival_time: "",
      departure_time: "",
      drop_off_type: "",
      pickup_type: "",
      shape_dist_traveled: "",
      stop_headsign: "",
      stop_sequence: "",
      trip_id: "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      const db = getFirestore();
      const stopRef = doc(db, "stop_times-web-data", editedStop.id);
      await updateDoc(stopRef, updatedStopInfo);
      const updatedStops = stops.map((stop) =>
        stop.id === editedStop.id ? { ...stop, ...updatedStopInfo } : stop
      );
      setStops(updatedStops);
      handleCloseModal();
      toast.success("Stop times updated successfully");
    } catch (error) {
      toast.error("Error while updating stop times: " + error.message);
      console.error("Error while updating stop times: ", error);
    }
  };

  const handleSelectedDelete = async () => {
    const selectedIds = selectedStops.map((stop) => stop.id);
    try {
      const db = getFirestore();
      await Promise.all(
        selectedIds.map((id) => deleteDoc(doc(db, "stop_times-web-data", id)))
      );
      const updatedStops = stops.filter(
        (stop) => !selectedIds.includes(stop.id)
      );
      setStops(updatedStops);
      setSelectedStops([]);
      toast.success("Selected stops deleted successfully");
    } catch (error) {
      console.error("Error deleting stops:", error);
      toast.error("Error deleting selected stops");
    }
  };

  const handleToggleAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedStops([...stops]);
    } else {
      setSelectedStops([]);
    }
  };

  const handleToggleSelect = (id) => {
    const index = selectedStops.findIndex((stop) => stop.id === id);
    if (index === -1) {
      const stop = stops.find((stop) => stop.id === id);
      setSelectedStops([...selectedStops, stop]);
    } else {
      const updatedSelectedStops = [...selectedStops];
      updatedSelectedStops.splice(index, 1);
      setSelectedStops(updatedSelectedStops);
    }
  };

  const handleDelete = async (count) => {
    try {
      const db = getFirestore();
      const stopToDelete = stops.find((stop) => stop.count === count);
      if (!stopToDelete) {
        toast.error("Stop not found for count: " + count);
        return;
      }
      await deleteDoc(doc(db, "stop_times-web-data", stopToDelete.id));
      const updatedStops = stops.filter((stop) => stop.count !== count);
      setStops(updatedStops);
      setSelectedStops(selectedStops.filter((stop) => stop.count !== count));
      toast.success("Stop deleted successfully for count: " + count);
    } catch (error) {
      console.error("Error deleting stop:", error);
      toast.error("Error deleting stop for count: " + count);
    }
  };

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const filteredStopsData = stops.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    return ['stop_id', 'arrival_time', 'departure_time', 'trip_id'].some((field) =>
      item[field]
        ? item[field].toLowerCase().includes(searchTermLower)
        : false
    );
  });
  const paginatedStops = filteredStopsData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <ToastContainer />
      <div className="container-fluid px-3 pt-4">
        <div className="row">
          <div className="col-lg-12 p-3">
            <div className="text-center">
              <h5 className="text-uppercase p-2 page-title">Stops Times Data</h5>
            </div>
            <SearchFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            fields={['stop_id', 'arrival_time', 'departure_time', 'trip_id']}
            />
          </div>

          <div className="col-lg-12 p-3">
            <Button
              variant="danger"
              onClick={handleSelectedDelete}
              disabled={selectedStops.length === 0}
            >
              Delete Selected
            </Button>

            <Button variant="info" onClick={handleToggleAll} className="ms-2">
              {selectAll ? "Unselect All" : "Select All"}
            </Button>
          </div>
          <Table striped bordered hover responsive className="overflow-scroll">
            <thead>
              <tr>
                <th>
                  <Form.Check
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleToggleAll}
                  />
                </th>
                <th>Stop ID</th>
                <th>Arrival Time</th>
                <th>Departure Time</th>
                <th>Drop Off Type</th>
                <th>Pickup Type</th>
                <th>Shape Distance Traveled</th>
                <th>Stop Headsign</th>
                <th>Stop Sequence</th>
                <th>Trip ID</th>
                <th>Modify</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStops.map((stop) => (
                <tr key={stop.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedStops.some((s) => s.id === stop.id)}
                      onChange={() => handleToggleSelect(stop.id)}
                    />
                  </td>
                  <td>{stop.stop_id}</td>
                  <td>{stop.arrival_time}</td>
                  <td>{stop.departure_time}</td>
                  <td>{stop.drop_off_type}</td>
                  <td>{stop.pickup_type}</td>
                  <td>{stop.shape_dist_traveled}</td>
                  <td>{stop.stop_headsign}</td>
                  <td>{stop.stop_sequence}</td>
                  <td>{stop.trip_id}</td>
                  <td className="d-flex gap-2">
                    <Button variant="primary" onClick={() => handleEdit(stop)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(stop.count)}
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
                {currentPage < Math.ceil(filteredStopsData.length / pageSize) && (
                  <Pagination.Item
                    onClick={() => handlePaginationClick(currentPage + 1)}
                  >
                    {currentPage + 1}
                  </Pagination.Item>
                )}
                <Pagination.Next
                  onClick={() => handlePaginationClick(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredStopsData.length / pageSize)}
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
          <Modal.Title>Edit Stop Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row className="gap-3">
              <Col>
                <Form.Group>
                  <Form.Label>Stop ID</Form.Label>
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
                  <Form.Label>Arrival Time</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.arrival_time}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        arrival_time: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Departure Time</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.departure_time}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        departure_time: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Drop Off Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.drop_off_type}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        drop_off_type: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Pickup Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.pickup_type}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        pickup_type: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Shape Distance Traveled</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.shape_dist_traveled}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        shape_dist_traveled: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Stop Headsign</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.stop_headsign}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        stop_headsign: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Stop Sequence</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.stop_sequence}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        stop_sequence: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Trip ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.trip_id}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        trip_id: e.target.value,
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

export default StopsTimeWeb;

