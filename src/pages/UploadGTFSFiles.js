import React, { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import {
  collection,
  getFirestore,
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import ProgressBar from "react-bootstrap/ProgressBar";

export const UploadGTFSFiles = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const storage = getStorage();
  const db = getFirestore();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const parseGTFSFile = async (file) => {
    const gtfsData = [];

    const fileContent = await file.text();
    const lines = fileContent.split("\n");

    // Assuming the first line contains the headers
    const headers = lines[0].split(",").map((header) => header.trim());

    // Iterate over each line (excluding header) and create objects
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((value) => value.trim());
      const data = {};

      headers.forEach((header, index) => {
        // Check if value exists before assigning
        if (values[index] !== undefined && values[index] !== "") {
          data[header] = values[index];
        }
      });

      // Add data to gtfsData only if at least one field is present
      if (Object.keys(data).length > 0) {
        gtfsData.push(data);
      }
    }

    return gtfsData;
  };

  const uploadDataToFirestore = async (batchData, fileName) => {
    const batch = writeBatch(db);
    const gtfsDataCollectionRef = collection(db, `${fileName}-web-data`);

    batchData.forEach((data) => {
      const docRef = doc(gtfsDataCollectionRef);
      batch.set(docRef, data);
    });

    await batch.commit();
  };

  const handleSubmit = async (e) => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    try {
      const docRef = ref(storage, `gtfs/${file.name}`);
      const uploadTask = uploadBytesResumable(docRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          toast.error("Error while uploading file");
          console.error("Error while uploading file", error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const gtfsData = await parseGTFSFile(file);
            const batchSize = 100; // Adjust the batch size as needed

            for (let i = 0; i < gtfsData.length; i += batchSize) {
              const batchData = gtfsData.slice(i, i + batchSize);
              await uploadDataToFirestore(
                batchData,
                file.name.split(".").slice(0, -1).join(".")
              );
            }

            setFile(null);
            toast.success("File uploaded successfully");
            console.log("File uploaded successfully");
            window.location.reload();
          } catch (error) {
            toast.error("Error while uploading file");
            console.error("Error while uploading file", error);
          }
        }
      );
    } catch (error) {
      toast.error("Error while uploading file");
      console.error("Error while uploading file", error);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container-fluid px-3 pt-4">
        <div className="row">
          <div className="col-lg-12 p-3">
            <div className="text-center  ">
              <h5 className="text-uppercase p-2 page-title">
                Upload GTFS Web Data
              </h5>
              <div className="upload_data mt-4">
                <input type="file" className=" shadow py-2 px-3" style={{borderRadius:"10px 0px 0px 10px"}} onChange={handleFileChange} accept=".txt" />
                {uploadProgress > 0 && (
                  <ProgressBar
                    now={uploadProgress}
                    label={`${uploadProgress}%`}
                  />
                )}
                <button
                className="btn btn-success px-3 py-2"
                onClick={handleSubmit}
              >
                Upload Data
              </button>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </>
  );
};
