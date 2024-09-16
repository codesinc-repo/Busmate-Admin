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
  Form,
  Button,
  Row,
  Container,
  Col,
  Modal,
  Pagination,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchFilter from "../../components/SearchFilter";

export function RoutesWebData() {
  const [routes, setRoutes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editedRoute, setEditedRoute] = useState(null);
  const [updatedRouteInfo, setUpdatedRouteInfo] = useState({
    route_short_name: "",
    route_id: "",
    route_color: "",
    route_text_color: "",
    route_type: "",
    route_url: "",
    route_long_name: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getRoutes = async () => {
      try {
        const db = getFirestore();
        const routesCollection = await getDocs(
          collection(db, "routes-web-data")
        );
        const routesData = routesCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutes(routesData);
        console.log("Route data is:", routesData);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };

    getRoutes();
  }, []);

  const handleEdit = (route) => {
    setEditedRoute(route);
    setShowModal(true);
    setUpdatedRouteInfo(route);
  };

  const handleCloseModal = () => {
    setEditedRoute(null);
    setShowModal(false);
    setUpdatedRouteInfo({
      route_short_name: "",
      route_id: "",
      route_color: "",
      route_text_color: "",
      route_type: "",
      route_url: "",
      route_long_name: "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      const db = getFirestore();
      const routeRef = doc(db, "routes-web-data", editedRoute.id);
      await updateDoc(routeRef, updatedRouteInfo);

      const updatedRoutes = routes.map((route) =>
        route.id === editedRoute.id ? { ...route, ...updatedRouteInfo } : route
      );
      setRoutes(updatedRoutes);
      handleCloseModal();
      toast.success("Route updated successfully");
    } catch (error) {
      toast.error("Error while updating route:", error);
      console.log("Error while updating route:", error);
    }
  };

  const handleDelete = async (count) => {
    try {
      const db = getFirestore();
      const routeToDelete = routes.find((route) => route.count === count);
      if (routeToDelete) {
        await deleteDoc(doc(db, "routes-web-data", routeToDelete.id));
        setRoutes((prevRoutes) =>
          prevRoutes.filter((route) => route.count !== count)
        );
        console.log("Route deleted successfully:", routeToDelete);
      } else {
        console.error("Route with count", count, "not found.");
      }
    } catch (error) {
      console.error("Error deleting route:", error);
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
        const routeToDelete = routes.find((route) => route.count === count);
        if (routeToDelete) {
          await deleteDoc(doc(db, "routes-web-data", routeToDelete.id));
        } else {
          console.error("Route with count", count, "not found.");
        }
      }

      setRoutes((prevRoutes) =>
        prevRoutes.filter((route) => !selectedRows.includes(route.count))
      );
      console.log("Selected routes deleted successfully:", selectedRows);
      setSelectedRows([]);
    } catch (error) {
      console.error("Error deleting selected routes:", error);
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
    return ["route_short_name", "route_id", "route_url", "route_long_name"].some(
      (field) =>
        item[field]
          ? item[field].toLowerCase().includes(searchTermLower)
          : false
    );
  });
  const paginatedStops = filteredRoutesData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <div className="container-fluid px-3 pt-4">
        <div className="row">
          <div className="col-lg-12 p-3">
            <div className="text-center">
              <h5 className="text-uppercase p-2 page-title">Routes Web Data</h5>
            </div>
            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              fields={["route_short_name", "route_id", "route_url", "route_long_name"]}
            />
          </div>
          <div className="col-lg-12 p-3">
            <Button variant="danger" onClick={handleDeleteSelected}>
              Delete Selected
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
                {Object.keys(updatedRouteInfo).map((key) => (
                  <th key={key}>{key.replace(/_/g, " ")}</th>
                ))}
                <th>Action</th>
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
                  {Object.keys(updatedRouteInfo).map((key) => (
                    <td key={key}>{route[key]}</td>
                  ))}
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
          <Modal.Title>Edit Route Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row>
              {Object.keys(updatedRouteInfo).map((key) => (
                <Col key={key} md={6}>
                  <Form.Group>
                    <Form.Label>{key.replace(/_/g, " ")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={updatedRouteInfo[key]}
                      onChange={(e) =>
                        setUpdatedRouteInfo({
                          ...updatedRouteInfo,
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

      <ToastContainer />
    </>
  );
}
