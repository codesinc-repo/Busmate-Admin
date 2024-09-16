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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Shapes1() {
  const [shapes, setShapes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editedShapeIndex, setEditedShapeIndex] = useState(null);
  const [updatedShapeInfo, setUpdatedShapeInfo] = useState({
    count: "",
    shape_id: "",
    shape_pt_lat: "",
    shape_pt_lon: "",
    shape_pt_sequence: "",
  });
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    const getShapes = async () => {
      try {
        const db = getFirestore();
        const shapesCollection = await getDocs(collection(db, "shapes"));
        const shapesData = shapesCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isSelected: false, // Add isSelected property to each shape
        }));
        setShapes(shapesData);
      } catch (error) {
        console.error("Error fetching shapes:", error);
      }
    };

    getShapes();
  }, []);

  const handleEdit = (index) => {
    setEditedShapeIndex(index);
    setShowModal(true);
    setUpdatedShapeInfo(shapes[index]);
  };

  const handleCloseModal = () => {
    setEditedShapeIndex(null);
    setShowModal(false);
    setUpdatedShapeInfo({
      count: "",
      shape_id: "",
      shape_pt_lat: "",
      shape_pt_lon: "",
      shape_pt_sequence: "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      const db = getFirestore();
      const shapeRef = doc(db, "shapes", shapes[editedShapeIndex].id);
      await updateDoc(shapeRef, updatedShapeInfo);
      const updatedShapes = shapes.map((shape, i) =>
        i === editedShapeIndex ? { ...shape, ...updatedShapeInfo } : shape
      );
      setShapes(updatedShapes);
      handleCloseModal();
      toast.success("Shape updated successfully");
    } catch (error) {
      toast.error("Error while updating shape:", error);
      console.error("Error while updating shape:", error);
    }
  };

  const handleDelete = async () => {
    const shapesToDelete = shapes.filter((shape) => shape.isSelected);
    if (shapesToDelete.length === 0) {
      toast.error("Please select shapes to delete.");
      return;
    }
    try {
      const db = getFirestore();
      const batch = db.batch();
      shapesToDelete.forEach((shape) => {
        const shapeRef = doc(db, "shapes", shape.id);
        batch.delete(shapeRef);
      });
      await batch.commit();
      setShapes((prevShapes) => prevShapes.filter((shape) => !shape.isSelected));
      setSelectedShapes([]);
      toast.success("Selected shapes deleted successfully");
    } catch (error) {
      toast.error("Error deleting shapes:", error);
      console.error("Error deleting shapes:", error);
    }
  };

  const handleSelectShape = (index) => {
    const updatedShapes = [...shapes];
    updatedShapes[index].isSelected = !updatedShapes[index].isSelected;
    setShapes(updatedShapes);

    if (updatedShapes[index].isSelected) {
      setSelectedShapes((prevSelectedShapes) => [
        ...prevSelectedShapes,
        updatedShapes[index].id,
      ]);
    } else {
      setSelectedShapes((prevSelectedShapes) =>
        prevSelectedShapes.filter((shapeId) => shapeId !== updatedShapes[index].id)
      );
    }
  };

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const paginatedStops = shapes.slice(
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
              <h5 className="text-uppercase p-2 page-title">Shapes_1 Data</h5>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Button
              variant="danger"
              className="mb-3"
              onClick={handleDelete}
              disabled={selectedShapes.length === 0}
            >
              Delete Selected
            </Button>
            <Table striped bordered hover className="overflow-scroll">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Count</th>
                  <th>Shape Id</th>
                  <th>Shape_pt_lat</th>
                  <th>Shape_pt_lon</th>
                  <th>Shape_pt_sequence</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStops.map((shape, index) => (
                  <tr key={shape.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={shape.isSelected}
                        onChange={() => handleSelectShape(index)}
                      />
                    </td>
                    <td className="text-secondary">
                      <b>{shape.count}</b>
                    </td>
                    <td>{shape.shape_id}</td>
                    <td>{shape.shape_pt_lat}</td>
                    <td>{shape.shape_pt_lon}</td>
                    <td>{shape.shape_pt_sequence}</td>
                    <td className="d-flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleEdit(index)}
                      >
                        Edit
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
                {currentPage < Math.ceil(shapes.length / pageSize) && (
                  <Pagination.Item
                    onClick={() => handlePaginationClick(currentPage + 1)}
                  >
                    {currentPage + 1}
                  </Pagination.Item>
                )}
                <Pagination.Next
                  onClick={() => handlePaginationClick(currentPage + 1)}
                  disabled={currentPage === Math.ceil(shapes.length / pageSize)}
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
          <Modal.Title>Edit Shapes_1 Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row className="gap-3">
              <Col>
                <Form.Group>
                  <Form.Label>New Count</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedShapeInfo.count}
                    onChange={(e) =>
                      setUpdatedShapeInfo({
                        ...updatedShapeInfo,
                        count: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Shape Id</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedShapeInfo.shape_id}
                    onChange={(e) =>
                      setUpdatedShapeInfo({
                        ...updatedShapeInfo,
                        shape_id: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Shape_pt_lat</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedShapeInfo.shape_pt_lat}
                    onChange={(e) =>
                      setUpdatedShapeInfo({
                        ...updatedShapeInfo,
                        shape_pt_lat: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>New Shape_pt_lon</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedShapeInfo.shape_pt_lon}
                    onChange={(e) =>
                      setUpdatedShapeInfo({
                        ...updatedShapeInfo,
                        shape_pt_lon: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>New Shape_pt_sequence</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedShapeInfo.shape_pt_sequence}
                    onChange={(e) =>
                      setUpdatedShapeInfo({
                        ...updatedShapeInfo,
                        shape_pt_sequence: e.target.value,
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

export default Shapes1;
