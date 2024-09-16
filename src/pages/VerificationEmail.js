import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, Modal } from 'react-bootstrap';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../Config';
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'; // Import necessary Firebase auth functions

const AdminVerificationPage = () => {
  const [emails, setEmails] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [verificationMessage, setVerificationMessage] = useState(''); // State to hold verification message
  const auth = getAuth();

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const usersRef = collection(db, 'RegisteredUsers');
      const snapshot = await getDocs(usersRef);
      const emailSet = new Set();
      const emailList = [];
      
      snapshot.docs.forEach(doc => {
        const email = doc.data().email;
        if (!emailSet.has(email)) {
          emailSet.add(email);
          emailList.push({
            id: doc.id,
            email,
            username: doc.data().username,
            verified: doc.data().verified || false,
            status: doc.data().status || 'No',
            verifiedUntil: doc.data().verifiedUntil || null,
          });
        }
      });

      setEmails(emailList);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const sendVerificationLink = async (email) => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`, // Replace with your app's verification URL
        handleCodeInApp: true,
      };

      // Here you would typically send the email verification link to the user's email
      // For demo purposes, let's simulate sending the link and updating Firestore
      console.log(`Activation link sent to ${email}.`);
      
      // Mark email in Firestore
      const emailRef = doc(db, 'RegisteredUsers', email);
      await setDoc(emailRef, {
        verified: false,
        status: 'Pending',
        verifiedUntil: null,
      }, { merge: true });

      // Show verification message in a modal or popup
      setVerificationMessage(`Activation link sent to ${email}.`);
      setShowModal(true);

      // Refresh email list after marking
      fetchEmails();
    } catch (error) {
      console.error('Error sending activation link:', error);
      alert('Failed to send activation link.');
    }
  };

  const handleVerifyEmail = async (email) => {
    try {
      // Check if the email link is valid and sign in the user
      if (isSignInWithEmailLink(auth, window.location.href)) {
        await signInWithEmailLink(auth, window.location.href);
        
        // Update verification status in Firestore
        const emailRef = doc(db, 'RegisteredUsers', email);
        await setDoc(emailRef, {
          verified: true,
          status: 'Yes',
          verifiedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }, { merge: true });

        // Show verification success message in a modal or popup
        setVerificationMessage(`Email ${email} verified successfully.`);
        setShowModal(true);

        // Refresh email list after verification
        fetchEmails();
      } else {
        console.error('Invalid email verification link.');
        alert('Invalid email verification link.');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      alert('Failed to verify email. Please try again.');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value || '';
    setSearchEmail(value.toLowerCase());
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setVerificationMessage('');
  };

  const filteredEmails = emails.filter(email => {
    return email.email && email.email.toLowerCase().includes(searchEmail);
  });

  return (
    <Container>
      <h2>Email Verification Administration</h2>
      <Form.Group>
        <Form.Control
          type="text"
          placeholder="Search by email"
          value={searchEmail}
          onChange={handleSearch}
        />
      </Form.Group>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Email</th>
            <th>Display Name</th>
            <th>Verified</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmails.map(email => (
            <tr key={email.id}>
              <td>{email.email}</td>
              <td>{email.username}</td>
              <td>{email.verified ? 'Yes' : 'No'}</td>
              <td>{email.status}</td>
              <td>
                {!email.verified ? (
                  <Button onClick={() => sendVerificationLink(email.email)}>Send Verification</Button>
                ) : (
                  <div>
                    <Button onClick={() => handleVerifyEmail(email.email)}>Verify Again</Button>
                    <p>Verified Until: {email.verifiedUntil ? email.verifiedUntil.toDate().toLocaleDateString() : 'N/A'}</p>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal or Popup for Verification Messages */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Email Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{verificationMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminVerificationPage;
