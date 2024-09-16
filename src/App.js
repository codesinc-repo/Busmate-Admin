import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Resetpassword from "./pages/Resetpassword";
import Forgotpassword from "./pages/Forgotpassword";
import MainLayout from "./components/MainLayout";
import Productlist from "./pages/All_Mobile_Data/Calendar_dates";
import Addcolor from "./pages/UserList";
import Addcat from "./pages/UserDetails";
import Addbrand from "./pages/All_Mobile_Data/Calendar";
import AddCoupon from "./pages/ManageMobileData";
import ViewOrder from "./pages/AllData/Shapes_1";
import AddEdits from "./pages/AllData/Calendar2";
import RegisteredUser from "./pages/RegisteredUser";
import ProductApproval from "./pages/All_Mobile_Data/Routes_data";
import Register from "./pages/Signup";
import Settings from "./pages/Settings";
import UserList from "./pages/UserList";
import UserDetails from "./pages/UserDetails";
import Customization from "./pages/Customization";
import Configration from "./pages/Configration";
import ManageMobileData from "./pages/ManageMobileData";
import DeleteMobileData from "./pages/DeleteMobileData";
import CalendarDates from "./pages/All_Mobile_Data/Calendar_dates";
import Shapes1 from "./pages/AllData/Shapes_1";
import Stops2 from "./pages/AllData/Stops2";
import StopsTime1 from "./pages/All_Mobile_Data/StopTimes_1";
import StopsTime2 from "./pages/All_Mobile_Data/StopTimes_2";
import Trips1 from "./pages/AllData/Trips1";
import Trips2 from "./pages/All_Mobile_Data/Trips_Data";
import VehicleTracking from "./pages/VechicleTracking";
import NotificationForm from "./pages/NotificationForm";
import { UploadGTFSFiles } from "./pages/UploadGTFSFiles";
import PartnersRequest from "./pages/Partners-Request";
import ContactRequest from "./pages/Contact-Request";
import { CalendarWeb } from "./pages/All_Web_Data/calendar_web_dat";
import { CalendarAttributesWeb } from "./pages/All_Web_Data/calendar_attributes_web";
import { CalendarDatesWeb } from "./pages/All_Web_Data/calendar_dates_web";
import { RoutesWebData } from "./pages/All_Web_Data/routes_web_data";
import { UploadMobileData } from "./pages/UploadGTFSMobileData";
import StopesWebData from "./pages/All_Web_Data/stopes_web_data";
import StopsTimeWeb from "./pages/All_Web_Data/stopes_times_web_data";
import ShapesWebData from "./pages/All_Web_Data/shapes_web_data";
import TripsWebData from "./pages/All_Web_Data/trips_web_data";
import CalendarMobile from "./pages/All_Mobile_Data/Calendar";
import RoutesMobileData from "./pages/All_Mobile_Data/Routes_data";
import ShapesAppData from "./pages/All_Mobile_Data/Shapes_Data";
import StopesAppData from "./pages/All_Mobile_Data/Stops_Data";
import TripsAppData from "./pages/All_Mobile_Data/Trips_Data";
import AgencyData from "./pages/AllData/AgencyData";
import AgencyData2 from "./pages/AllData/AgencyData2";
import AdminVerificationPage from "./pages/VerificationEmail";
import PaymentHistory from './pages/PaymentHistory'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/reset-password" element={<Resetpassword />} />
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/admin" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="RegisteredUser" element={<RegisteredUser />} />
          {/* <Route path="enquiries/:id" element={<ViewEnq />} /> */}
          <Route path="Configration" element={<Configration />} />
          <Route path="ManageMobileData" element={<ManageMobileData />} />
          <Route path="coupon/:id" element={<AddCoupon />} />
          <Route path="uploadgtfsfiles" element={<UploadGTFSFiles />} />
          <Route path="upload_mobile_data" element={<UploadMobileData />} />
          <Route path="DeleteMobileData" element={<DeleteMobileData />} />

          <Route path="order/:id" element={<ViewOrder />} />
          <Route path="Settings" element={<Settings />} />
          <Route path="Add-Edits" element={<AddEdits />} />
          <Route path="User-List" element={<UserList />} />
          <Route path="color/:id" element={<Addcolor />} />
          <Route path="Product-Approval" element={<ProductApproval />} />
          <Route path="category" element={<Addcat />} />
          <Route path="User-Details" element={<UserDetails />} />
          <Route path="Customization" element={<Customization />} />
          <Route path="add-designer" element={<Addbrand />} />
          <Route path="brand/:id" element={<Addbrand />} />
          <Route path="list-product" element={<Productlist />} />

          <Route path="AllData/Agency1" element={<AgencyData />} />
          <Route path="AllData/Agency2" element={<AgencyData2 />} />
          
          <Route path="All_Mobile_Data/Calendar_Mobile" element={<CalendarMobile />} />
          <Route path="All_Mobile_Data/Calendar_Dates_Mobile" element={<CalendarDates />} />
          <Route path="All_Mobile_Data/Routes_Mobile" element={<RoutesMobileData />} />
          <Route path="All_Mobile_Data/Shapes_Mobile" element={<ShapesAppData />} />
          <Route path="All_Mobile_Data/Stops_Mobile" element={<StopesAppData />} />
          <Route path="All_Mobile_Data/Stops_Time_1_Mobile" element={<StopsTime1 />} />
          <Route path="All_Mobile_Data/Stops_Time_2_Mobile" element={<StopsTime2 />} />
          <Route path="All_Mobile_Data/Trips_Mobile" element={<TripsAppData />} />

          {/* <Route path="AllData/Calendar_dates" element={<CalendarDates />} /> */}
          <Route path="AllData/Shapes" element={<Shapes1 />} />
          <Route path="AllData/Stops2" element={<Stops2 />} />
          <Route path="AllData/Stops_Times1" element={<StopsTime1 />} />
          <Route path="AllData/Stops_Times2" element={<StopsTime2 />} />
          <Route path="AllData/Trips1" element={<Trips1 />} />
          <Route path="AllData/Trips2" element={<Trips2 />} />


          <Route path="/admin/Vehicle-Tracking" element={<VehicleTracking/>}/>
          <Route path="/admin/send-notification" element={<NotificationForm/>}/>
          <Route path="/admin/Partners-Request" element={<PartnersRequest/>}/>
          <Route path="/admin/Contact-Request" element={<ContactRequest/>}/>


          <Route path="All_Web_Data/CalendarWeb" element={<CalendarWeb/>}/>
          <Route path="All_Web_Data/Calendar_Attributes_Web" element={<CalendarAttributesWeb/>}/>
          <Route path="All_Web_Data/Calendar_Dates_Web" element={<CalendarDatesWeb/>}/>
          <Route path="All_Web_Data/Routes_Web" element={<RoutesWebData/>}/>
          <Route path="All_Web_Data/Stopes_Web" element={<StopesWebData/>}/>
          <Route path="All_Web_Data/Stops_Time_Web" element={<StopsTimeWeb/>}/>
          <Route path="All_Web_Data/Shapes_Time_Web" element={<ShapesWebData/>}/>
          <Route path="All_Web_Data/Trips_Web" element={<TripsWebData/>}/>


          {/* verify emails */}

          <Route path="/admin/verify-email" element={<AdminVerificationPage/>}/>
          <Route path="/admin/Payment-Status" element={<PaymentHistory/>}/>
          

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
