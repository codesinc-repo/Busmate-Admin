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
  Spinner,
} from "react-bootstrap/";
import { db } from "../../Config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchFilter from "../../components/SearchFilter";
import Loader from "../../components/Loader";
function TripsAppData() {
  const [stops, setStops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editedStop, setEditedStop] = useState(null);
  const [updatedStopInfo, setUpdatedStopInfo] = useState({
    trip_id: "",
    direction_id:"",
    route_id:"",
    service_id:"",
    shape_id:"",
  });
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getStops = async () => {
      try {
        setIsLoading(true);
        const db = getFirestore(); // Initialize Firestore directly here
        const stopsCollection = await getDocs(collection(db, "trips2"));
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
        toast.success("Data fetched successfully");
      } catch (error) {
        console.log("Error fetching trips:", error);
      } finally {
        setIsLoading(false);
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
      trip_id: "",
      direction_id:"",
      route_id:"",
      service_id:"",
      shape_id:"",
    });
  };

  const handleSaveChanges = async () => {
    try {
      const stopRef = doc(db, "trips2", editedStop.id);
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
      setLoading(true);
      await deleteDoc(doc(db, "trips2", id));
      setStops((prevStops) => prevStops.filter((stop) => stop.id !== id));
      toast.success("Stop deleted successfully");
    } catch (error) {
      console.error("Error deleting stop:", error);
      toast.error("Error deleting stop");
    }finally {
      setLoading(false);
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
      setLoading(true);
      for (const stop of selectedStops) {
        await deleteDoc(doc(db, "trips2", stop.id));
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
    }finally {
      setLoading(false);
    }
  };


  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const filteredStopsData = stops.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    return ['trip_id', 'direction_id', 'route_id', 'service_id', 'shap_id'].some((field) =>
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
      <Container fluid>
        <Row>
          <Col lg={12} className="p-3">
            <div className="text-center">
              <h5 className="text-uppercase p-2 page-title">Trips Data</h5>
            </div>
            <SearchFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            fields={['trip_id', 'direction_id', 'route_id', 'service_id', 'shap_id']}
            />
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
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                "Delete Selected"
              )}
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
                  <th>Trip_Id</th>
                  <th>Direction_Id</th>
                  <th>Route_Id</th>
                  <th>Service_Id</th>
                  <th>Shap_Id</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8}>
                      <Loader />
                    </td>
                  </tr>

                ) : (
                  paginatedStops.map((stop) => (
                    <tr key={stop.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={stop.isSelected}
                          onChange={() => handleSelectStop(stop.id)}
                        />
                      </td>
                      <td className="text-secondary">
                        <b>{stop.trip_id}</b>
                      </td>
                      <td>{stop.direction_id}</td>
                      <td>{stop.route_id}</td>
                      <td>{stop.service_id}</td>
                      <td>{stop.shape_id}</td>
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
                  ))
                )}
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
          </Col>
        </Row>
      </Container>
      <Modal
        show={showModal}
        size="lg"
        centered
        onHide={handleCloseModal}
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
                  <Form.Label>Trip Id</Form.Label>
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
                <Form.Group>
                  <Form.Label>Direction Id</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.direction_id}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        direction_id: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Route Id</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.route_id}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        route_id: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Service Id</Form.Label>
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
                  <Form.Label>Shape Id</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.shape_id}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        shape_id: e.target.value,
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

export default TripsAppData;
