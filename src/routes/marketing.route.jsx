// routes/EventRoutes.jsx

import { Routes, Route } from "react-router-dom";

import CheckAuth from "../components/common/check-auth";
import ProtectedRoute from "../components/common/ProtectedRoute";





import FacebookMarketingPage from "../pages/marketing/social/facebook/FacebookMarketingPage.jsx";
import FacebookAdsManager from "../pages/marketing/social/facebook/facebookAdManager/FacebookAdsManager.jsx";

import EmailMarketingCenter from '../pages/marketing/email/EmailMarketingCenter.jsx';
import SMSMarketingCenter from "../pages/marketing/sms/SMSMarketingCenter.jsx";





export default function EventRoutes() {
  return (
    <Routes>
      <Route
        path="/marketing"
        element={<CheckAuth />}
      >
        

        <Route path="facebook" element={<ProtectedRoute permissions={["event.view"]}><FacebookMarketingPage /></ProtectedRoute>}/>
        <Route path="facebook-ads" element={<ProtectedRoute permissions={["event.view"]}><FacebookAdsManager /></ProtectedRoute>}/>
        <Route path="email" element={<EmailMarketingCenter />}/>
        <Route path="sms" element={<SMSMarketingCenter />}/>

      </Route>
     
    </Routes>
  );
}