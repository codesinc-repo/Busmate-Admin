import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import {
  Table,
  Form,
  Container,
  Col,
  Row,
  Modal,
  Button,
  Pagination,
  Spinner,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchFilter from "../../components/SearchFilter";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Loader from "../../components/Loader";

function RoutesMobileData() {
  const [routes, setRoutes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editedRoute, setEditedRoute] = useState(null);
  const [updatedRoute, setUpdatedRoute] = useState({
    agency_id: "",
    route_color: "",
    route_long_name: "",
    route_short_name: "",
    route_type: "",
    route_text_color:"",
    route_decs:"",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Page size is fixed to 10
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        const routesCollection = await getDocs(collection(db, "routes2"));
        const routesData = routesCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutes(routesData);
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleEdit = (route) => {
    setEditedRoute(route);
    setUpdatedRoute(route);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditedRoute(null);
    setShowModal(false);
    setUpdatedRoute({
      agency_id: "",
    route_color: "",
    route_long_name: "",
    route_short_name: "",
    route_type: "",
    route_text_color:"",
    route_decs:"",
    });
  };

  const saveChanges = async () => {
    try {
      const db = getFirestore();
      const routeRef = doc(db, "routes2", editedRoute.id);
      await updateDoc(routeRef, updatedRoute);

      const updatedRoutes = routes.map((route) =>
        route.id === editedRoute.id ? { ...route, ...updatedRoute } : route
      );
      setRoutes(updatedRoutes);
      handleCloseModal();
      toast.success("Route updated successfully");
    } catch (error) {
      console.error("Error while updating route:", error);
      toast.error("Error while updating route");
    }
  };

  const handleDelete = async (routeId) => {
    try {
      setLoading(true);
      const db = getFirestore();
      await deleteDoc(doc(db, "routes2", routeId));
      setRoutes((prevRoutes) => prevRoutes.filter((route) => route.id !== routeId));
      toast.success("Route deleted successfully");
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("Error deleting route");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRow = (routeId) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(routeId)
        ? prevSelectedRows.filter((selectedRouteId) => selectedRouteId !== routeId)
        : [...prevSelectedRows, routeId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === routes.length) {
      try {
        setLoading(true);
        const db = getFirestore();
        const batch = writeBatch(db);
        const routesCollection = await getDocs(collection(db, "routes2"));
  
        routesCollection.docs.forEach((route) => {
          const routeRef = doc(db, "routes2", route.id);
          batch.delete(routeRef);
        });
  
        await batch.commit();
        setRoutes([]);
        setSelectedRows([]);
        toast.success("All routes deleted successfully");
      } catch (error) {
        console.error("Error deleting routes:", error);
        toast.error("Error deleting routes");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const db = getFirestore();
        const batch = writeBatch(db);
  
        selectedRows.forEach((routeId) => {
          const routeRef = doc(db, "routes2", routeId);
          batch.delete(routeRef);
        });
  
        await batch.commit();
  
        const updatedRoutes = routes.filter((route) => !selectedRows.includes(route.id));
        setRoutes(updatedRoutes);
        setSelectedRows([]);
        toast.success("Selected routes deleted successfully");
      } catch (error) {
        console.error("Error deleting selected routes:", error);
        toast.error("Error deleting selected routes");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectAll = () => {
    const allRouteIds = routes.map((route) => route.id);
    setSelectedRows(allRouteIds);
  };
  

  const handleUnselectAll = () => {
    setSelectedRows([]);
  };

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const filteredRoutesData = routes.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    return ["route_long_name", "route_color", "route_id", "route_type"].some((field) =>
      item[field] ? item[field].toLowerCase().includes(searchTermLower) : false
    );
  });

  const paginatedRoutes = filteredRoutesData.slice(
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
              <h5 className="text-uppercase p-2 page-title">Routes Data</h5>
            </div>
            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              fields={["route_long_name", "route_color", "route_id", "route_type"]}
            />
          </div>
          <div className="col-lg-12 p-3">
            <Button
              variant="danger"
              onClick={handleDeleteSelected}
              disabled={loading || selectedRows.length === 0}
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
            <Button variant="info" onClick={handleSelectAll} className="ms-2">
              Select All
            </Button>
            <Button variant="info" onClick={handleUnselectAll} className="ms-2">
              Unselect All
            </Button>
          </div>
          <Table striped bordered hover responsive className="overflow-scroll">
            <thead>
              <tr>
                <th>Select</th>
                <th>Route_Id</th>
                <th>Route_Color</th>
                <th>Route_Short_Name</th>
                <th>Route_Long_Name</th>
                <th>Route_Type</th>
                <th>Route_Text_Color</th>
                <th>Modify</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center">
                    <Loader />
                  </td>
                </tr>
              ) : (
                paginatedRoutes.map((route) => (
                  <tr key={route.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(route.id)}
                        onChange={() => handleToggleRow(route.id)}
                      />
                    </td>
                    <td className="text-secondary">{route.id}</td>
                    <td>{route.route_color}</td>
                    <td>{route.route_short_name}</td>
                    <td>{route.route_long_name}</td>
                    <td>{route.route_type}</td>
                    <td>{route.route_text_color}</td>

                    <td className="d-flex gap-1">
                      <Button variant="primary" onClick={() => handleEdit(route)}>
                        <FaEdit />
                      </Button>{" "}
                      <Button variant="danger" onClick={() => handleDelete(route.id)}>
                        <FaTrashAlt />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <div className="d-flex justify-content-center">
            <Pagination>
              {[...Array(Math.ceil(filteredRoutesData.length / pageSize)).keys()].map(
                (page) => (
                  <Pagination.Item
                    key={page + 1}
                    active={page + 1 === currentPage}
                    onClick={() => handlePaginationClick(page + 1)}
                  >
                    {page + 1}
                  </Pagination.Item>
                )
              )}
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
          <Modal.Title>Edit Routes Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row className="gap-3">
              <Col>
                <Form.Group>
                  <Form.Label>New Route Color</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.route_color}
                    onChange={(e) =>
                      setUpdatedRoute({ ...updatedRoute, route_color: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Route ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.id}
                    onChange={(e) =>
                      setUpdatedRoute({ ...updatedRoute, id: e.target.value })
                    }
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>New Route Text Color</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.route_text_color}
                    onChange={(e) =>
                      setUpdatedRoute({ ...updatedRoute, route_text_color: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="gap-3 mt-3">
              <Col>
                <Form.Group>
                  <Form.Label>Route Long Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.route_long_name}
                    onChange={(e) =>
                      setUpdatedRoute({ ...updatedRoute, route_long_name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Route Short Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.route_short_name}
                    onChange={(e) =>
                      setUpdatedRoute({ ...updatedRoute, route_short_name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Route Type Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.route_type}
                    onChange={(e) =>
                      setUpdatedRoute({ ...updatedRoute, route_type: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RoutesMobileData;
