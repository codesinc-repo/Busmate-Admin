import React, { useState, useEffect } from "react";
import { Table, Container, Card, Spinner, Row, Col } from "react-bootstrap";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../Config";

const PaymentHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, "stripe_events");
        const q = query(eventsCollection, orderBy("created", "desc"));
        const querySnapshot = await getDocs(q);
        const eventsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events: ", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <p className="ms-3">Loading...</p>
      </Container>
    );
  }

  if (error) {
    return <Container className="mt-4">Error loading events: {error.message}</Container>;
  }

  return (
    <Container className="mt-5">
      <Card>
        <Card.Body>
          <Card.Title className="text-center mb-4">Payment History</Card.Title>
          <Row>
            <Col>
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>Line 1</th>
                    <th>Line 2</th>
                    <th>Postal Code</th>
                    <th>State</th>
                    <th>Invoice Prefix</th>
                    <th>Customer Name</th>
                    <th>Customer Phone</th>
                    <th>Footer</th>
                    <th>Livemode</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const data = event.data || {};
                    const address = data.address || {};
                    const invoiceSettings = data.invoice_settings || {};

                    return (
                      <tr key={event.id}>
                        <td>{event.id}</td>
                        <td>{event.type}</td>
                        <td>{data.email || "N/A"}</td>
                        <td>{new Date(data.created * 1000).toLocaleString()}</td>
                        <td>{address.city || "N/A"}</td>
                        <td>{address.country || "N/A"}</td>
                        <td>{address.line1 || "N/A"}</td>
                        <td>{address.line2 || "N/A"}</td>
                        <td>{address.postal_code || "N/A"}</td>
                        <td>{address.state || "N/A"}</td>
                        <td>{data.invoice_prefix || "N/A"}</td>
                        <td>{data.name || "N/A"}</td>
                        <td>{data.phone || "N/A"}</td>
                        <td>{invoiceSettings.footer || "N/A"}</td>
                        <td>{data.livemode ? "True" : "False"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentHistory;
