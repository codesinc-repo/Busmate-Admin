// src/components/DeleteData.js
import React, { useState } from 'react';
import {db,doc,deleteDoc,getDocs,collection} from "../Config";

const DeleteData = () => {
  const [docId, setDocId] = useState('');

  // Function to delete a single document by ID
  const handleDeleteDocument = async (id) => {
    try {
      await deleteDoc(doc(db, 'YOUR_COLLECTION_NAME', id));
      console.log(`Document with ID ${id} has been deleted`);
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  // Function to delete all documents in a collection
  const handleDeleteAll = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'YOUR_COLLECTION_NAME'));
      querySnapshot.forEach(async (document) => {
        await deleteDoc(doc(db, 'YOUR_COLLECTION_NAME', document.id));
      });
      console.log('All documents have been deleted');
    } catch (error) {
      console.error('Error deleting all documents: ', error);
    }
  };

  return (
    <div>
      <h2>Delete Data from Firestore</h2>
      <div>
        <input 
          type="text" 
          placeholder="Document ID" 
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
        />
        <button onClick={() => handleDeleteDocument(docId)}>Delete Document</button>
      </div>
      <div>
        <button onClick={handleDeleteAll}>Delete All Documents</button>
      </div>
    </div>
  );
};

export default DeleteData;
