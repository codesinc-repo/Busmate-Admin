import React, { useState, useEffect } from "react";
import {
  sendNotification,
  getNotifications,
  deleteNotification,
} from "../Config";
import { Form, Button, Container, Row, Col, Table } from "react-bootstrap";
import { toast } from "react-toastify";

const NotificationForm = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    // toast.error('Failed to fetch notifications');

  }, []);

  const fetchNotifications = async () => {
    try {
      const fetchedNotifications = await getNotifications();
      setNotifications(fetchedNotifications);
    } catch (error) {
      toast.error("Error fetching notifications:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the notification
      await sendNotification(title, body);
      // Clear the form
      setTitle("");
      setBody("");
      // Fetch updated notifications
      fetchNotifications();
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Delete the notification with the specified ID
      await deleteNotification(id);
      // Fetch updated notifications
      fetchNotifications();
      toast.success('Notification deleted successfully');
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error('Failed to delete notification');
    }
  };

  return (
    <Container>
      <Row className="d-flex align-items-center justify-content-center p-5">
        <Col xs="8">
          <div>
            <h2 className="text-center mb-4">Send Notification</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Enter Message Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="message title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Enter Message Detail</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="message detail"
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Notify Now
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs="8">
          <h2 className="text-center mb-4">Notifications</h2>
          <Table striped bordered hover>
  <thead>
    <tr>
      <th>ID</th>
      <th>Title</th>
      <th>Body</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {notifications.map((notification) => (
      <tr key={notification.id}>
        <td>{notification.id}</td>
        <td>{notification.title}</td>
        <td>{notification.body}</td>
        <td>
          {/* Pass the notification ID to the handleDelete function */}
          <Button variant="danger" onClick={() => handleDelete(notification.id)}>
            Delete
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>

        </Col>
      </Row>
    </Container>
  );
};

export default NotificationForm;
