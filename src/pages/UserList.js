import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Col, Container, Pagination } from "react-bootstrap";
import { Row } from "antd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { generateToken, messaging } from "../Config";
import { onMessage } from "firebase/messaging";
import SearchFilter from "../components/SearchFilter";

function UserList() {
  const [showNotificationModal, setNotificationModal] = useState(false);
  useEffect(() => {
    generateToken();
    onMessage(messaging, (payload) => {
      console.log("Payload is:", payload);
      setNotificationModal(true);
      toast.success(payload.notification.body);
    });
  }, []);

  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatedUserInfo, setUpdatedUserInfo] = useState({
    businessName: "",
    country: "",
    email: "",
    phoneNumber: "",
    username: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const db = getFirestore();
        const usersCollection = await getDocs(collection(db, "RegisteredUsers"));
        const usersData = usersCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
    setUpdatedUserInfo(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setUpdatedUserInfo({
      businessName: "",
      country: "",
      email: "",
      phoneNumber: "",
      username: "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      const db = getFirestore();
      const userRef = doc(db, "RegisteredUsers", editingUser.id);
      await updateDoc(userRef, updatedUserInfo);
      const updatedUsers = users.map((user) =>
        user.id === editingUser.id ? { ...user, ...updatedUserInfo } : user
      );
      setUsers(updatedUsers);
      handleCloseModal();
      toast.success("User updated successfully:", editingUser);
    } catch (error) {
      toast.error("Error updating user:", error);
    }
  };

  const handleDelete = async (index) => {
    const user = users[index];
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "RegisteredUsers", user.id));
      setUsers((prevUsers) => prevUsers.filter((_, i) => i !== index));
      toast.success("User deleted successfully:", user);
    } catch (error) {
      toast.error("Error deleting user:", error);
    }
  };

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase();
    return ['email', 'businessName', 'phoneNumber', 'username'].some((field) =>
      user[field] ? user[field].toLowerCase().includes(searchTermLower) : false
    );
  });

  

  const paginatedStops = filteredUsers.slice(
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
              <h5 className="text-uppercase p-2 page-title">Registered Users</h5>
            </div>
            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              fields={['email', 'businessName', 'phoneNumber', 'username']}
            />
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Country</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStops.map((user, index) => (
                <tr key={index}>
                  <td>{user.businessName}</td>
                  <td>{user.country}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.username}</td>
                  <td>
                    <Button variant="primary" onClick={() => handleEdit(user)}>
                      Edit
                    </Button>{" "}
                    <Button variant="danger" onClick={() => handleDelete(index)}>
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
                <Pagination.Item onClick={() => handlePaginationClick(currentPage - 1)}>
                  {currentPage - 1}
                </Pagination.Item>
              )}
              <Pagination.Item active>{currentPage}</Pagination.Item>
              {currentPage < Math.ceil(filteredUsers.length / pageSize) && (
                <Pagination.Item onClick={() => handlePaginationClick(currentPage + 1)}>
                  {currentPage + 1}
                </Pagination.Item>
              )}
              <Pagination.Next
                onClick={() => handlePaginationClick(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredUsers.length / pageSize)}
              />
            </Pagination>
          </div>
          {/* Edit User Modal */}
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
              <Modal.Title>Edit User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Container fluid>
                <Row className="gap-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>New Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={updatedUserInfo.username}
                        onChange={(e) =>
                          setUpdatedUserInfo({
                            ...updatedUserInfo,
                            username: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>New BusinessName</Form.Label>
                      <Form.Control
                        type="text"
                        value={updatedUserInfo.businessName}
                        onChange={(e) =>
                          setUpdatedUserInfo({
                            ...updatedUserInfo,
                            businessName: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>New Email</Form.Label>
                      <Form.Control
                        type="text"
                        value={updatedUserInfo.email}
                        onChange={(e) =>
                          setUpdatedUserInfo({
                            ...updatedUserInfo,
                            email: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>New Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={updatedUserInfo.phoneNumber}
                        onChange={(e) =>
                          setUpdatedUserInfo({
                            ...updatedUserInfo,
                            phoneNumber: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>New Country Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={updatedUserInfo.country}
                        onChange={(e) =>
                          setUpdatedUserInfo({
                            ...updatedUserInfo,
                            country: e.target.value,
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
        </div>
      </div>
    </>
  );
}

export default UserList;
