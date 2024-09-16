import React, { useEffect, useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  AiOutlineDashboard,
  AiOutlineSetting,
  AiOutlineUserSwitch,
  AiOutlineNotification,
  AiOutlineHighlight,
  AiOutlineAlert,
  AiOutlineUser,
  AiOutlineCreditCard
} from "react-icons/ai";
import {
  FaBusinessTime,
  FaCalendar,
  FaCalendarDays,
  FaCalendarPlus,
  FaGlobe,
  FaMapLocation,
  FaRegCalendarCheck,
  FaRoute,
  FaShapes,
  FaUpload,
  FaBuilding,
  FaBusSimple, 
  faCreditCard 
} from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { FcDataConfiguration } from "react-icons/fc";
import { IoIosNotifications } from "react-icons/io";
import {
  FaMobileAlt,
  FaDatabase,
  FaStop,
  FaStopCircle,
  FaTripadvisor,
  FaBusAlt,
} from "react-icons/fa";
import {
  BiCategoryAlt,
  BiCustomize,
  BiSolidShapes,
  BiSolidTime,
  BiUser,
} from "react-icons/bi";
import { Layout, Menu, theme } from "antd";
import { useNavigate } from "react-router-dom";
import { BsCardList, BsMap, BsStop } from "react-icons/bs";
import { MdOutlineDeleteSweep, MdWeb } from "react-icons/md";
import { getUserFromLocalStorage } from "../utils/localstorage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const { Header, Sider, Content } = Layout;
const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const user = getUserFromLocalStorage();
    setUserData(user);
  }, []);

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem("user");
    toast.success("you are logged out");

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handleMenuClick = ({ key }) => {
    // Check if the user is logged in
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate(key);
      } else {
        toast.error("You must be logged in");
        setTimeout(() => {
          navigate("/"); // Change "/login" to the actual login page route
        },1000);
      }
    });
  };
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Layout /* onContextMenu={(e) => e.preventDefault()} */>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <h2 className="text-white fs-5 text-center py-2 mb-0">
            <span className="sm-logo">
              <img src="/images/logo2.png" width={50} />
            </span>
            <span className="lg-logo">
              {" "}
              <img src="/images/logo white.png" width={200} />
            </span>
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[""]}
          onClick={handleMenuClick}
          items={[
            {
              key: "",
              icon: <AiOutlineDashboard className="fs-4" />,
              label: "Dashboard",
            },

            {
              key: "Manage Users",
              icon: <BiUser className="fs-4" />,
              label: "Manage Users",
              children: [
                {
                  key: "User-List",
                  icon: <BsCardList className="fs-4" />,
                  label: "All Users",
                },
              ],
            },

            {
              key: "Admin For Mobile",
              icon: <FaMobileAlt className="fs-4" />,
              label: "Admin For Mobile",
              children: [
                // {
                //   key: "ManageMobileData",
                //   icon: <FaDatabase className="fs-4" />,
                //   label: "Manage Mobile Data",
                // },
                {
                  key: "upload_mobile_data",
                  icon: <FaUpload className="fs-4" />,
                  label: "Upload Mobile Data",
                },
                // {
                //   key: "DeleteMobileData",
                //   icon: <MdOutlineDeleteSweep className="fs-4" />,
                //   label: "Delete Mobile Data",
                // },
              ],
            },
            {
              key: "Admin For Web",
              icon: <MdWeb className="fs-4" />,
              label: "Admin For Web",
              children: [
                {
                  key: "uploadgtfsfiles",
                  icon: <FaUpload className="fs-4" />,
                  label: "Upload GTFS Files",
                },
              ],
            },
            {
              key: "All Routes Mobile Data",
              icon: <FaMapLocation className="fs-4" />,
              label: "All Routes Mobile Data",
              children: [
                {
                  key: "Calendar",
                  icon: <FaCalendar className="fs-4" />,
                  label: "Calendar",

                  children: [
                    {
                      key: "All_Mobile_Data/Calendar_Mobile",
                      icon: <FaCalendarPlus className="fs-4" />,
                      label: "Calendar Data",
                    },
                    // {
                    //   key: "AllData/Calendar2",
                    //   icon: <FaRegCalendarCheck className="fs-4" />,
                    //   label: "Calendar_02",
                    // },
                    {
                      key: "All_Mobile_Data/Calendar_Dates_Mobile",
                      icon: <FaCalendarDays className="fs-4" />,
                      label: "C_dates",
                    },
                  ],
                },
                {
                  key: "Routes App",
                  icon: <FaRoute className="fs-4" />,
                  label: "Routes",

                  children: [
                    {
                      key: "All_Mobile_Data/Routes_Mobile",
                      icon: <FaRoute className="fs-4" />,
                      label: "Routes Data",
                    },
                  ],
                },
                {
                  key: "Shapes App",
                  icon: <FaShapes className="fs-4" />,
                  label: "Shapes",

                  children: [
                    {
                      key: "All_Mobile_Data/Shapes_Mobile",
                      icon: <BiSolidShapes className="fs-4" />,
                      label: "Shapes Data",
                    },
                    // {
                    //   key: "AllData/Shapes2",
                    //   icon: <BiSolidShapes className="fs-4" />,
                    //   label: "Shapes_02",
                    // },
                  ],
                },
                {
                  key: "Stops App",
                  icon: <FaStop className="fs-4" />,
                  label: "Stops",
                  children: [
                    {
                      key: "All_Mobile_Data/Stops_Mobile",
                      icon: <BsStop className="fs-4" />,
                      label: "Stops Data",
                    },

                    {
                      key: "All_Mobile_Data/Stops_Time_1_Mobile",
                      icon: <BiSolidTime className="fs-4" />,
                      label: "S_times-01",
                    },
                    {
                      key: "All_Mobile_Data/Stops_Time_2_Mobile",
                      icon: <FaBusinessTime className="fs-4" />,
                      label: "S_times-02",
                    },
                  ],
                },
                {
                  key: "Trips Mobile",
                  icon: <FaTripadvisor className="fs-4" />,
                  label: "Trips",

                  children: [
                    {
                      key: "All_Mobile_Data/Trips_Mobile",
                      icon: <FaTripadvisor className="fs-4" />,
                      label: "Trips Data",
                    },

                  ],
                },

                {
                  key: "Agency",
                  icon: <FaBuilding  className="fs-4" />,
                  label: "Agency",

                  children: [
                    // {
                    //   key: "AllData/Agency1",
                    //   icon: <FaBusSimple className="fs-4" />,
                    //   label: "Agency1",
                    // },
                     {
                       key: "AllData/Agency2",
                       icon: <FaBusAlt className="fs-4" />,
                       label: "Agency2",
                     },
                  ],
                },
              ],
            },
            {
              key: "All Routes Web Data",
              icon: <FaGlobe className="fs-4" />,
              label: "All Routes Web Data",
              children: [
                {
                  // key: "Calendar",
                  icon: <FaCalendar className="fs-4" />,
                  label: "Calendar",

                  children: [
                    {
                      key: "All_Web_Data/CalendarWeb",
                      icon: <FaCalendarPlus className="fs-4" />,
                      label: "Calendar Web",
                    },
                    // {
                    //   key: "All_Web_Data/Calendar_Attributes_Web",
                    //   icon: <FaRegCalendarCheck className="fs-4" />,
                    //   label: "Calendar Attributes",
                    // },
                    // {
                    //   key: "All_Web_Data/Calendar_Dates_Web",
                    //   icon: <FaCalendarDays className="fs-4" />,
                    //   label: "C_dates",
                    // },
                  ],
                },
                {
                  key: "Routes",
                  icon: <FaRoute className="fs-4" />,
                  label: "Routes",

                  children: [
                    {
                      key: "All_Web_Data/Routes_Web",
                      icon: <FaRoute className="fs-4" />,
                      label: "Routes Web",
                    },
                  ],
                },
                {
                  key: "Shapes Web",
                  icon: <FaShapes className="fs-4" />,
                  label: "Shapes Web",

                  children: [
                    {
                      key: "All_Web_Data/Shapes_Time_Web",
                      icon: <BiSolidShapes className="fs-4" />,
                      label: "Shapes Data",
                    },
                  ],
                },
                {
                  key: "Stops",
                  icon: <FaStop className="fs-4" />,
                  label: "Stops",

                  children: [
                    {
                      key: "All_Web_Data/Stopes_Web",
                      icon: <BsStop className="fs-4" />,
                      label: "Stops_Data",
                    },
                    // {
                    //   key: "AllData/Stops2",
                    //   icon: <FaStopCircle className="fs-4" />,
                    //   label: "Stops_02",
                    // },
                    {
                      key: "All_Web_Data/Stops_Time_Web",
                      icon: <BiSolidTime className="fs-4" />,
                      label: "Stop_times",
                    },
                    // {
                    //   key: "AllData/Stops_Times2",
                    //   icon: <FaBusinessTime className="fs-4" />,
                    //   label: "S_times-02",
                    // },
                  ],
                },
                {
                  key: "Trips",
                  icon: <FaTripadvisor className="fs-4" />,
                  label: "Trips",

                  children: [
                    {
                      key: "All_Web_Data/Trips_Web",
                      icon: <FaTripadvisor className="fs-4" />,
                      label: "Trips Data",
                    },
                  ],
                },
              ],
            },
            {
              key: "Vehicle-Tracking",
              icon: <AiOutlineHighlight className="fs-4" />,
              label: "Vehicle-Tracking",
            },

            {
              key: "send-notification",
              icon: <AiOutlineNotification className="fs-4" />,
              label: "send-notification",
            },

            {
              key: "Partners-Request",
              icon: <AiOutlineAlert className="fs-4" />,
              label: "Partners-Request",
            },

            {
              key: "Contact-Request",
              icon: <AiOutlineUser className="fs-4" />,
              label: "Contact-Request",
            },

            {
              key: "verify-email",
              icon: <AiOutlineUser className="fs-4" />,
              label: "AdminVerificationPage",
            },

            {
              key: "Payment-Status",
              icon: <AiOutlineCreditCard  className="fs-4" />,
              label: "Payment-Status",
            },
            // {
            //   key: "Product-Approval",
            //   icon: <BiCheckSquare className="fs-4" />,
            //   label: "Product Approval",
            // },
            // {
            //   key: "RegisteredUser",
            //   icon: <BiUser className="fs-4" />,
            //   label: "Registered User",
            // },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          className="sticky-top d-flex justify-content-between ps-1 pe-5"
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: "trigger",
              onClick: () => setCollapsed(!collapsed),
            }
          )}
          <div className="d-flex gap-4 align-items-center">
            <div className="position-relative">
              <IoIosNotifications className="fs-4" />
              <span className="badge bg-warning rounded-circle p-1 position-absolute">
                3
              </span>
            </div>

            <div className="d-flex gap-3 align-items-center dropdown">
              <div>
                <img
                  width={32}
                  height={32}
                  src="/images/logo2.jpg"
                  className="object-fit-cover"
                  alt=""
                />
              </div>
              {userData ? (
                <>
                  <div
                    role="button"
                    id="dropdownMenuLink"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <h5 className="mb-0">Admin</h5>
                    <p className="mb-0">{userData.email}</p>
                  </div>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuLink"
                  >
                    <li>
                      <Link
                        className="dropdown-item py-1 mb-1"
                        style={{ height: "auto", lineHeight: "20px" }}
                      >
                        View Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item py-1 mb-1"
                        style={{ height: "auto", lineHeight: "20px" }}
                        onClick={handleLogout}
                      >
                        Signout
                      </Link>
                    </li>
                  </div>
                </>
              ) : (
                <div className="">
                  <Link to="/" className="nav-link">
                    <b>Login</b>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Header>
        <Content
          style={{
            background: colorBgContainer,
          }}
        >
          <ToastContainer
            position="top-right"
            autoClose={250}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            theme="light"
          />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
export default MainLayout;
