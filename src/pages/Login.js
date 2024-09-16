import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Config"
import {getAuth, signInWithEmailAndPassword} from "firebase/auth"
import {storeUserToLocalStorage} from "../utils/localstorage"

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]  = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  
  const handleLogin = (e) => {
    e.preventDefault();
    const loginForm = document.getElementById("login");
    setLoading(true);
    const log = signInWithEmailAndPassword(auth,email, password).then((userCredentails) => {
      const user = userCredentails.user;
      storeUserToLocalStorage({email: user.email})
      toast.success("Welcome admin");
      if(user.email === "adminbusmate@gmail.com") {
        loginForm.reset();
        toast.success("Welcome admin");
        setTimeout(() => {
          navigate("/admin");
        }, 1000)
      }
      else{
        toast.error("Invalid credentials");
      }
      setLoading(false);
    })
    .catch((err) => {
     const errorMessage = err.message;
      console.error("error is ",errorMessage)
     toast.error("Invalid Credentials", errorMessage);
    }) 
  };

  return (
    <>
      <div className="container-fluid admin-login-container d-flex align-items-center justify-content-center m-0">
        <div className="content">
          <div className="text-center">
          <img src="/images/logo.jpg" width={260} alt="Bus Mate Logo" />
          </div>
          <form className="content__form d-flex flex-column gap-3 " id="login" onSubmit={handleLogin}>
            <div className="content__inputs ">
                <input
                  required
                  type="text"
                  placeholder="adminbusmate@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-100 rounded-3 border-1 p-2 my-2"
                />
                
                <input
                  required
                  type="password"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-100 rounded-3 border-1 p-2 my-2"
                />
            </div>
            <button type="submit" className="p-2 rounded-3 bg-dark text-light">
              {loading ? "Signing in.." : "Log In" }
            </button>
          </form>
          <div className="content__or-text text-center my-2">
            <span />
            <span>
              OR
            </span>
            <span />
          </div>
          <div className="content__forgot-buttons text-center">
            <Link >
             Forget Password
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Login;
