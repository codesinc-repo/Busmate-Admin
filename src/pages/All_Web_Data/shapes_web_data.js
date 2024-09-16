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

function ShapesWebData() {
  const [shapes, setShapes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editedShape, setEditedShape] = useState(null);
  const [updatedShapeInfo, setUpdatedShapeInfo] = useState({
    shape_id: "",
    shape_pt_lat: "",
    shape_pt_lon: "",
    shape_pt_sequence: "",
    shape_dist_traveled: "",
  });
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); 
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const getShapes = async () => {
      try {
        const db = getFirestore(); // Initialize Firestore directly here
        const shapesCollection = await getDocs(collection(db, "shapes-web-data"));
        const shapesData = shapesCollection.docs.map((doc) => {
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
        setShapes(shapesData);
        
        toast.success("Data fetched successfully");
      } catch (error) {
        console.error("Error fetching shapes:", error);
      }
    };

    getShapes();
  }, []);

  const handleEdit = (shape) => {
    setEditedShape(shape);
    setShowModal(true);
    setUpdatedShapeInfo(shape);
  };

  const handleCloseModal = () => {
    setEditedShape(null);
    setShowModal(false);
    setUpdatedShapeInfo({
      shape_id: "",
      shape_pt_lat: "",
      shape_pt_lon: "",
      shape_pt_sequence: "",
      shape_dist_traveled: "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      const shapeRef = doc(db, "shapes-web-data", editedShape.id);
      await updateDoc(shapeRef, updatedShapeInfo);
      const updatedShapes = shapes.map((shape) =>
        shape.id === editedShape.id ? { ...shape, ...updatedShapeInfo } : shape
      );
      setShapes(updatedShapes);
      handleCloseModal();
      toast.success("Shape updated successfully");
    } catch (error) {
      toast.error("Error while updating shape:", error);
      console.error("Error while updating shape:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "shapes-web-data", id));
      setShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== id));
      toast.success("Shape deleted successfully");
    } catch (error) {
      console.error("Error deleting shape:", error);
      toast.error("Error deleting shape");
    }
  };

  const handleSelectShape = (id) => {
    const updatedShapes = shapes.map((shape) =>
      shape.id === id ? { ...shape, isSelected: !shape.isSelected } : shape
    );
    setShapes(updatedShapes);
    setSelectedShapes(updatedShapes.filter((shape) => shape.isSelected));
    setSelectAll(updatedShapes.every((shape) => shape.isSelected));
  };

  const handleSelectAll = () => {
    const updatedShapes = shapes.map((shape) => ({ ...shape, isSelected: !selectAll }));
    setShapes(updatedShapes);
    setSelectedShapes(updatedShapes.filter((shape) => shape.isSelected));
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    try {
      for (const shape of selectedShapes) {
        await deleteDoc(doc(db, "shapes-web-data", shape.id));
      }
      setShapes((prevShapes) =>
        prevShapes.filter((shape) => !selectedShapes.includes(shape))
      );
      setSelectedShapes([]);
      setSelectAll(false);
      toast.success("Selected shapes deleted successfully");
    } catch (error) {
      console.error("Error deleting selected shapes:", error);
      toast.error("Error deleting selected shapes");
    }
  };

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const filteredShapesData = shapes.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    return ['shape_id', 'shape_lat', 'shape_lon'].some((field) =>
      item[field]
        ? item[field].toLowerCase().includes(searchTermLower)
        : false
    );
  });
  const paginatedStops = filteredShapesData.slice(
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
              <h5 className="text-uppercase p-2 page-title">Shapes Data</h5>
            </div>
            <SearchFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            fields={['shape_id', 'shape_lat', 'shape_lon']}
            />
          </Col>
        </Row>
        {console.log("shapesData: ", shapes)}
        <Row>
          <Col lg={12}>
            <Button
              variant="danger"
              className="mb-3"
              onClick={handleDeleteSelected}
              disabled={selectedShapes.length === 0}
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
                  <th>Shape_Id</th>
                  <th>Shape_Lat</th>
                  <th>Shape_Lon</th>
                  <th>Shape_Sequence</th>
                  <th>Dist_Traveled</th>
                  <th>Modify</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStops.map((shape) => (
                  <tr key={shape.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={shape.isSelected}
                        onChange={() => handleSelectShape(shape.id)}
                      />
                    </td>
                    <td className="text-secondary">
                      <b>{shape.shape_id}</b>
                    </td>
                    <td>{shape.shape_pt_lat}</td>
                    <td>{shape.shape_pt_lon}</td>
                    <td>{shape.shape_pt_sequence}</td>
                    <td>{shape.shape_dist_traveled}</td>
                    <td className="d-flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleEdit(shape)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(shape.id)}
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
                {currentPage < Math.ceil(filteredShapesData.length / pageSize) && (
                  <Pagination.Item
                    onClick={() => handlePaginationClick(currentPage + 1)}
                  >
                    {currentPage + 1}
                  </Pagination.Item>
                )}
                <Pagination.Next
                  onClick={() => handlePaginationClick(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredShapesData.length / pageSize)}
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
          <Modal.Title>Edit Shape Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row className="gap-3">
              <Col>
                <Form.Group>
                  <Form.Label>Shape Id</Form.Label>
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
                  <Form.Label>Shape Lat</Form.Label>
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
                <Form.Group>
                  <Form.Label>Shape Lon</Form.Label>
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
                  <Form.Label>Shape Sequence</Form.Label>
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
                <Form.Group>
                  <Form.Label>Dist Traveled</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedShapeInfo.shape_dist_traveled}
                    onChange={(e) =>
                      setUpdatedShapeInfo({
                        ...updatedShapeInfo,
                        shape_dist_traveled: e.target.value,
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

export default ShapesWebData;
