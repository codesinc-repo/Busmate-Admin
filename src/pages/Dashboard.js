import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { BsArrowDownRight } from "react-icons/bs";
import { Column } from "@ant-design/plots";
import { Table } from "antd";
import { Container, Row, Col, Card } from "react-bootstrap";

const Dashboard = () => {
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        const db = getFirestore();
        const usersCollection = await getDocs(collection(db, "RegisteredUsers"));
        const usersData = usersCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const sortedUsers = usersData.sort((a, b) => b.registrationDate - a.registrationDate);
        const latestUsers = sortedUsers.slice(0, 5);
        setRecentUsers(latestUsers);
      } catch (error) {
        console.error("Error fetching recent users:", error);
      }
    };

    fetchRecentUsers();
  }, []);

  const pricingPackages = [
    { name: "Bronze", price: "$20 / Month per User" },
    { name: "Silver", price: "$45 / Month per User" },
    { name: "Gold", price: "$150 / Month per User" },
    { name: "Platinum", price: "$300 / Month per User" },
  ];

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Business Name", dataIndex: "businessName", key: "businessName" },
    { title: "Country", dataIndex: "country", key: "country" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone Number", dataIndex: "phoneNumber", key: "phoneNumber" },
    { title: "Username", dataIndex: "username", key: "username" },
  ];

  const data = [
    { type: "Jan", sales: 38 },
    { type: "Feb", sales: 52 },
    { type: "Mar", sales: 61 },
    { type: "Apr", sales: 145 },
    { type: "May", sales: 48 },
    { type: "Jun", sales: 38 },
    { type: "July", sales: 38 },
    { type: "Aug", sales: 38 },
    { type: "Sept", sales: 38 },
    { type: "Oct", sales: 38 },
    { type: "Nov", sales: 38 },
    { type: "Dec", sales: 38 },
  ];

  const config = {
    data,
    xField: "type",
    yField: "sales",
    color: "#013767",
    label: {
      position: "middle",
      style: {
        fill: "#fff",
        opacity: 1,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      type: {
        alias: "Month",
      },
      sales: {
        alias: "Income",
      },
    },
  };

  return (
    <Container className="container-fluid px-3 pt-4">
      <div className="text-center">
        <h2 className="text-uppercase p-2 page-title">GTFS Admin Dashboard</h2>
      </div>
      <div className="mt-4">
        <h3 className="mb-3 title">Pricing Packages</h3>
        <Row className="pricing-packages">
          {pricingPackages.map((pricingPackage, index) => (
            <Col key={index} md={3} sm={6}>
              <Card>
                <Card.Body>
                  <Card.Title>{pricingPackage.name}</Card.Title>
                  <Card.Text>{pricingPackage.price}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <div className="mt-5">
        <h3 className="mb-3 title">Income Statistics</h3>
        <div>
          <Column {...config} />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="mb-5 title">Recent Users</h3>
        <div>
          <Table responsive striped bordered hover columns={columns} dataSource={recentUsers} />
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
