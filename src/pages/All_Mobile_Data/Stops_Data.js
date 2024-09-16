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
import SearchFilter from "../../components/SearchFilter";
import Loader from "../../components/Loader";
import { FaDeleteLeft } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

function StopesAppData() {
  const [stops, setStops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editedStop, setEditedStop] = useState(null);
  const [updatedStopInfo, setUpdatedStopInfo] = useState({
    stop_id: "",
    stop_lat: "",
    stop_lon: "",
    stop_name: "",
stop_code: "",
  });
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const getStops = async () => {
      try {
        setLoading(true);
        const db = getFirestore(); // Initialize Firestore directly here
        const stopsCollection = await getDocs(collection(db, "stops2"));
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
      } finally {
        setLoading(false);
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
      stop_lat: "",
      stop_lon: "",
      stop_name: "",
  stop_code: "",
    });
  };

  const handleSaveChanges = async () => {
    try {
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
      setIsLoading(true)
      await deleteDoc(doc(db, "stops2", id));
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
    const updatedStops = stops.map((stop) => ({
      ...stop,
      isSelected: !selectAll,
    }));
    setStops(updatedStops);
    setSelectedStops(updatedStops.filter((stop) => stop.isSelected));
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    try {
      setIsLoading(true)
      for (const stop of selectedStops) {
        await deleteDoc(doc(db, "stops2", stop.id));
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

  const filteredStopsData = stops.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    return ['stop_id', 'stop_name', 'stop_code'].some((field) =>
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
              <h5 className="text-uppercase p-2 page-title">Stops_2 Data</h5>
            </div>
            <SearchFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            fields={['stop_id', 'stop_name', 'stop_code']}
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
                  <th>Stop_Id</th>
                  <th>Stop_Name</th>
                  <th>Stop_Lat</th>
                  <th>Stop_Lon</th>
                  <th>Zone_Id</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <Loader />
                  </td>
                </tr>
              ) : (
                paginatedStops.length === 0 ? (
                  <tr>
                  <td colSpan={8} className="text-center">
                    no data found
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
                        <b>{stop.stop_id}</b>
                      </td>
                      <td>{stop.stop_name}</td>
                      <td>{stop.stop_lat}</td>
                      <td>{stop.stop_lon}</td>
                      <td>{stop.zone_id}</td>
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
                  ))
                )
              )}
                {}
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
                  <Form.Label>Stop Id</Form.Label>
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
                  <Form.Label>Stop Lat</Form.Label>
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
                <Form.Group>
                  <Form.Label>Stop Lon</Form.Label>
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
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Stop Name</Form.Label>
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
                  <Form.Label>Zone Id</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStopInfo.stop_code}
                    onChange={(e) =>
                      setUpdatedStopInfo({
                        ...updatedStopInfo,
                        stop_code: e.target.value,
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

export default StopesAppData;
