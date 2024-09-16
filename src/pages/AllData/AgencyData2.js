import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  writeBatch
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
  ProgressBar,
  Spinner,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchFilter from "../../components/SearchFilter";
function AgencyData2() {
  const [routes, setRoutes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editedRoute, setEditedRoute] = useState(null);
  const [updatedRoute, setUpdatedRoute] = useState({
    agency_lang: "",
    agency_name: "",
    agency_phone: "",
    agency_timezone: "",
    agency_url: "",
    route_id: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState(false); // State to manage delete progress
  const [deleteProgress, setDeleteProgress] = useState(0); // State to track delete progress
  useEffect(() => {
    const getRoutes = async () => {
      try {
        const db = getFirestore();
        const routesCollection = await getDocs(collection(db, "agency2"));
        const AgencyData = routesCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutes(AgencyData);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };

    getRoutes();
  }, []);

  const handleEdit = (route) => {
    setEditedRoute(route);
    setUpdatedRoute({ ...route }); // Ensure a new object is created to avoid state mutation
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditedRoute(null);
    setUpdatedRoute({
      agency_lang: "",
      agency_name: "",
      agency_phone: "",
      agency_timezone: "",
      agency_url: "",
      route_id: "",
    });
  };

  const saveChanges = async () => {
    try {
      const db = getFirestore();
      const routeRef = doc(db, "agency2", editedRoute.id);
      await updateDoc(routeRef, updatedRoute);

      const updatedRoutes = routes.map((route) =>
        route.id === editedRoute.id ? updatedRoute : route
      );
      setRoutes(updatedRoutes);
      handleCloseModal();
      toast.success("Routes updated successfully");
    } catch (error) {
      toast.error("Error while updating routes:", error.message);
      console.error("Error while updating routes:", error);
    }
  };

  const handleDelete = async (count) => {
    try {
      setDeleting(true); // Start delete operation
      const db = getFirestore();
      const routeToDelete = routes.find((route) => route.count === count);
      if (routeToDelete) {
        await deleteDoc(doc(db, "agency2", routeToDelete.id));
        setRoutes((prevRoutes) =>
          prevRoutes.filter((route) => route.count !== count)
        );
        toast.success("Route deleted successfully");
        console.log("Route deleted successfully:", routeToDelete);
      } else {
        console.error("Route with count", count, "not found.");
      }
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("Error deleting route");
    } finally {
      setDeleting(false); // End delete operation
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
      setDeleting(true); // Start delete operation
      const db = getFirestore();
  
      const batch = writeBatch(db);
  
      for (const count of selectedRows) {
        const routeToDelete = routes.find((route) => route.count === count);
        if (routeToDelete) {
          const routeRef = doc(db, "agency2", routeToDelete.id);
          batch.delete(routeRef);
        } else {
          console.error("Route with count", count, "not found.");
        }
      }
  
      await batch.commit(); // Commit the batch operation
  
      setRoutes((prevRoutes) =>
        prevRoutes.filter((route) => !selectedRows.includes(route.count))
      );
      toast.success("Selected routes deleted successfully");
      console.log("Selected routes deleted successfully:", selectedRows);
      setSelectedRows([]);
    } catch (error) {
      console.error("Error deleting selected routes:", error);
      toast.error("Error deleting selected routes");
    } finally {
      setDeleting(false); // End delete operation
    }
  };
  

  const handleSelectAll = () => {
    setSelectedRows(routes.map((route) => route.count));
  };

  const handleUnselectAll = () => {
    setSelectedRows([]);
  };

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const filteredRoutesData = routes.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    return ["agency_name", "agency_phone", "agency_url", "route_id"].some((field) =>
      item[field] ? item[field].toLowerCase().includes(searchTermLower) : false
    );
  });
  const paginatedStops = filteredRoutesData.slice(
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
              <h5 className="text-uppercase p-2 page-title">Agency Data</h5>
            </div>
            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              fields={["agency_name", "agency_phone", "agency_url", "route_id"]}
            />
          </div>
          <div className="col-lg-12 p-3">
          <Button
              variant="danger"
              onClick={handleDeleteSelected}
              disabled={deleting}
            >
              {deleting ? (
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
                {/* <th>Count</th> */}
                <th>Agency Lang</th>
                <th>Agency Name</th>
                <th>Agency Phone</th>
                <th>Agency Timezone</th>
                <th>Agency URL</th>
                <th>Route Id</th>
                <th>Modify</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStops.map((route) => (
                <tr key={route.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(route.count)}
                      onChange={() => handleToggleRow(route.count)}
                    />
                  </td>
                  {/* <td className="text-secondary">{route.count}</td> */}
                  <td>{route.agency_lang}</td>
                  <td>{route.agency_name}</td>
                  <td>{route.agency_phone}</td>
                  <td>{route.agency_timezone}</td>
                  <td>{route.agency_url}</td>
                  {/* <td>{route.route_color}</td> */}
                  <td>{route.agency_id}</td>
                  {/* <td>{route.route_long_name}</td> */}
                  <td>
                    <Button variant="primary" onClick={() => handleEdit(route)}>
                      Edit
                    </Button>{" "}
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(route.count)}
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
              {currentPage < Math.ceil(filteredRoutesData.length / pageSize) && (
                <Pagination.Item
                  onClick={() => handlePaginationClick(currentPage + 1)}
                >
                  {currentPage + 1}
                </Pagination.Item>
              )}
              <Pagination.Next
                onClick={() => handlePaginationClick(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredRoutesData.length / pageSize)}
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
          <Modal.Title>Edit Routes Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row className="gap-3">
              <Col>
                <Form.Group>
                  <Form.Label>Count</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.count}
                    onChange={(e) =>
                      setUpdatedRoute({
                        ...updatedRoute,
                        count: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Agency Lang</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.agency_lang}
                    onChange={(e) =>
                      setUpdatedRoute({
                        ...updatedRoute,
                        agency_lang: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Agency Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.agency_name}
                    onChange={(e) =>
                      setUpdatedRoute({
                        ...updatedRoute,
                        agency_name: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Agency Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.agency_phone}
                    onChange={(e) =>
                      setUpdatedRoute({
                        ...updatedRoute,
                        agency_phone: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Agency Timezone</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.agency_timezone}
                    onChange={(e) =>
                      setUpdatedRoute({
                        ...updatedRoute,
                        agency_timezone: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Agency URL</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.agency_url}
                    onChange={(e) =>
                      setUpdatedRoute({
                        ...updatedRoute,
                        agency_url: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Route Color</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.route_color}
                    onChange={(e) =>
                      setUpdatedRoute({
                        ...updatedRoute,
                        route_color: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Route Id</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.route_id}
                    onChange={(e) =>
                      setUpdatedRoute({
                        ...updatedRoute,
                        route_id: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Route Long Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedRoute.route_long_name}
                    onChange={(e) =>
                      setUpdatedRoute({
                        ...updatedRoute,
                        route_long_name: e.target.value,
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
          <Button variant="primary" onClick={saveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AgencyData2;
