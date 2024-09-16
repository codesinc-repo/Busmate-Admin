import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Config";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { Navigate } from "react-router-dom";
import { storeUserToLocalStorage} from "../utils/localstorage"
const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const auth = getAuth();
  const navigate = useNavigate();
  const db = getDatabase();
  const handleLogin = async (e) => {
    e.preventDefault();
    // For demonstration, check if email and password match predefined values
    const userCredentails = createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        storeUserToLocalStorage({email});
        toast.success("signup successfully", user.email);
        console.log("registered is", user);

        try {
          const docRef = addDoc(collection(db, "GTFS"), {
            userName: name,
          });
          toast.success("Document written with ID: ", docRef.id);
        } catch (e) {
          toast.error("Error adding document: ", e);
          console.log("Error adding document: ", e);
        }
        setTimeout(() => {
          navigate("/");
        }, 2000);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error("error while registering user", errorCode, errorMessage);
        // ..
      });
  };

  return (
    <>
      <div className="container-fluid admin-login-container admin-signup-container d-flex align-items-center justify-content-center m-0">
        <div className="content">
          <div className="text-center">
            <img src="/images/logo.jpg" width={260} alt="CC TM Logo" />
          </div>
          <form
            className="content__form d-flex flex-column gap-3 "
            onSubmit={handleLogin}
          >
            <div className="content__inputs ">
              <input
                required
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-100 rounded-3 border-1 p-2 my-2"
              />
              <input
                required
                type="text"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-100 rounded-3 border-1 p-2 my-2"
              />

              <input
                required
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-100 rounded-3 border-1 p-2 my-2"
              />
            </div>
            <button type="submit" className="p-2 rounded-3 text-light">
              Register
            </button>
          </form>
          <div className="content__or-text text-center my-2">
            <span />
            <span>OR</span>
            <span />
          </div>
          <div className="content__forgot-buttons text-center">
            <Link to={"/"}>already have an account?</Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Register;
