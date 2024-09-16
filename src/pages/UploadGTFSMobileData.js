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
  writeBatch,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export const UploadMobileData = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const storage = getStorage();
  const db = getFirestore();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const parseGTFSFile = async (file) => {
    try {
      const gtfsData = [];
      const fileContent = await file.text();
      const lines = fileContent.split("\n");

      if (lines.length <= 1) {
        throw new Error(`File ${file.name} is empty or contains no data`);
      }

      const headers = lines[0].split(",").map((header) => header.trim());

      const requiredFieldsMap = {
        "routes.txt": ["route_id", "route_long_name", "route_short_name", "route_type", "agency_id"],
        "shapes.txt": ["shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"],
        "agency.txt": ["agency_name", "agency_url", "agency_timezone"],
        "calendar.txt": ["service_id", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "start_date", "end_date"],
        "calendar_dates.txt": ["service_id", "date", "exception_type"],
        "fare_attributes.txt": ["fare_id", "price", "currency_type", "payment_method", "transfer"],
        "trips.txt": ["route_id", "service_id", "trip_id"],
      };

      const requiredFields = requiredFieldsMap[file.name];
      if (requiredFields) {
        const missingFields = requiredFields.filter((field) => !headers.includes(field));
        if (missingFields.length > 0) {
          throw new Error(`File ${file.name} is missing required fields: ${missingFields.join(", ")}`);
        }
      }

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((value) => value.trim());
        const data = {};

        headers.forEach((header, index) => {
          if (values[index] !== undefined && values[index] !== "") {
            data[header] = values[index];
          }
        });

        if (file.name === "shapes.txt" && data.shape_pt_sequence !== undefined) {
          const sequenceValue = parseInt(data.shape_pt_sequence, 10);
          // Uncomment the following lines if you need to validate the sequence value
          // if (isNaN(sequenceValue) || sequenceValue < 0) {
          //   throw new Error(`Invalid shape_pt_sequence value at line ${i + 1}: ${data.shape_pt_sequence}`);
          // }
        }

        if (Object.keys(data).length > 0) {
          gtfsData.push(data);
        }
      }

      if (gtfsData.length === 0) {
        throw new Error(`File ${file.name} contains no valid data`);
      }

      console.log("Parsed GTFS Data:", gtfsData);
      return gtfsData;
    } catch (error) {
      console.error("Error parsing GTFS file", error);
      document.getElementById("show_error").innerHTML = ` ${error.message}`;
      throw error;
    }
  };

  const uploadDataToFirestore = async (batchData, fileName) => {
    try {
      const batch = writeBatch(db);
      const gtfsDataCollectionRef = collection(db, `${fileName}2`);

      // Check if documents already exist and delete them
      const existingDocsQuery = query(gtfsDataCollectionRef);
      const existingDocsSnapshot = await getDocs(existingDocsQuery);

      existingDocsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Add new documents
      batchData.forEach((data) => {
        const docRef = doc(gtfsDataCollectionRef);
        batch.set(docRef, data);
      });

      await batch.commit();
      console.log("Batch committed successfully for file:", fileName);
    } catch (error) {
      console.error("Error uploading data to Firestore", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const docRef = ref(storage, `gtfs/${file.name}`);
      const uploadTask = uploadBytesResumable(docRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          toast.error("Error while uploading file");
          console.error("Error while uploading file", error);
          document.getElementById("show_error").innerHTML = ` ${error.message}`;
          setIsUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("File uploaded to:", downloadURL);
            const gtfsData = await parseGTFSFile(file);
            const batchSize = 100;

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

            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            toast.error(error.message);
            console.error("Error while processing file", error);
            document.getElementById("show_error").innerHTML = ` ${error.message}`;
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (error) {
      toast.error("Error while uploading file");
      console.error("Error while uploading file", error);
      document.getElementById("show_error").innerHTML = ` ${error.message}`;
      setIsUploading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container-fluid px-3 pt-4">
        <div className="row">
          <div className="col-lg-12 p-3">
            <div className="text-center">
              <h5 className="text-uppercase p-2 page-title">
                Upload GTFS Mobile Data
              </h5>
              <p className="fs-6 fw-bold text-danger" id="show_error">
                Upload only .txt files
              </p>
              <div className="upload_data mt-4">
                <input
                  type="file"
                  className="shadow py-2 px-3"
                  style={{ borderRadius: "10px 0px 0px 10px" }}
                  onChange={handleFileChange}
                  accept=".txt"
                />
                {isUploading && <div>{Math.round(uploadProgress)}%</div>}
                <button
                  className="btn btn-success px-3 py-2"
                  onClick={handleSubmit}
                  disabled={isUploading}
                >
                  Upload Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
