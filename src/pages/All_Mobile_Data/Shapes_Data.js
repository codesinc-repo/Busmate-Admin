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
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import SearchFilter from "../../components/SearchFilter";
import Loader from "../../components/Loader";
import { FaEdit } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
function ShapesAppData() {
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
  const [pageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getShapes = async () => {
      try {
        setLoading(true);
        const db = getFirestore(); // Initialize Firestore directly here
        const shapesCollection = await getDocs(collection(db, "shapes2"));
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
        // toast.success("Data fetched successfully");
        console.log("Data fetched successfully", shapesData)
      } catch (error) {
        console.error("Error fetching shapes:", error);
      } finally{
        setLoading(false);
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
      const shapeRef = doc(db, "shapes2", editedShape.id);
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
    setIsLoading(true);
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "shapes2", id));
      setShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== id));
      toast.success("Shape deleted successfully");
    } catch (error) {
      console.error("Error deleting shape:", error);
      toast.error("Error deleting shape");
    } finally {
      setIsLoading(false);
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
    const updatedShapes = shapes.map((shape) => ({
      ...shape,
      isSelected: !selectAll,
    }));
    setShapes(updatedShapes);
    setSelectedShapes(updatedShapes.filter((shape) => shape.isSelected));
    setSelectAll(!selectAll);
  };


  const handleDeleteSelected = async () => {
    try {
      setIsLoading(true);
        const db = getFirestore();

        // Check if selectedShapes is an array
        if (!Array.isArray(selectedShapes)) {
            console.error("selectedShapes is not an array");
            return; // or handle the error accordingly
        }

        // Log the value of selectedShapes
        console.log("selectedShapes:", selectedShapes);

        const deletedRows = [];

        for (const shape of selectedShapes) {
            await deleteDoc(doc(db, "shapes2", shape.id));
            deletedRows.push(shape); // Add the deleted shape to the array
            console.log("Deleted row:", shape); // Log the individual deleted row
        }

        // Filter out the deleted shapes from the state
        setShapes((prevShapes) => prevShapes.filter((shape) => !selectedShapes.some((selectedShape) => selectedShape.id === shape.id)));
        
        // Clear the selected shapes array
        setSelectedShapes([]);
        
        toast.success("Selected shapes deleted successfully");
    } catch (error) {
        console.error("Error deleting selected shapes:", error);
        toast.error("Error deleting selected shapes");
    } finally {
        setIsLoading(false);
    }
};

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const filteredShapesData = shapes.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    return ['shape_id', 'shape_pt_lat', 'shape_pt_lon', 'dist_traveled'].some((field) =>
      item[field]
        ? item[field].toLowerCase().includes(searchTermLower)
        : false
    );
  });
  const paginatedShapes = filteredShapesData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredShapesData.length / pageSize);

  return (
    <>
      <ToastContainer />
      <Container fluid>
        <Row>
          <Col lg={12} className="p-3">
            <div className="text-center">
              <h5 className="text-uppercase p-2 page-title">Shapes App Data</h5>
            </div>
            <SearchFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            fields={['shape_id', 'shape_pt_lat', 'shape_pt_lon', 'dist_traveled']}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Button
              variant="danger"
              className="mb-3"
              onClick={handleDeleteSelected}
              disabled={isLoading || selectedShapes.length === 0} // Disable button when isLoading is true or no shapes are selected
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
                      <th>Shape_Id</th>
                      <th>Shape_Lat</th>
                      <th>Shape_Lon</th>
                      <th>Shape_Sequence</th>
                      <th>Dist_Traveled</th>
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
                      paginatedShapes.length === 0 ? (
<tr>
                       <td colSpan={8} className="text-center">
                        no data found
                       </td>
                     </tr>
                      ) : (
                        paginatedShapes.map((shape) => (
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
                               <FaEdit />
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => handleDelete(shape.id)}
                              >
                                <FaDeleteLeft />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )
                    
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
                    {currentPage < totalPages && (
                      <Pagination.Item
                        onClick={() => handlePaginationClick(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </Pagination.Item>
                    )}
                    <Pagination.Next
                      onClick={() => handlePaginationClick(currentPage + 1)}
                      disabled={currentPage === totalPages}
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

export default ShapesAppData;
