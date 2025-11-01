import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { Outlet, useNavigation, useLocation } from "react-router-dom";
import Chatbot from '../components/Chatbot';
import { useSelector } from 'react-redux';

function RootLayout() {
  const navigation = useNavigation();
  const location = useLocation();
  const userData = useSelector((state) => state.auth.userData);
  const userId = userData?.user_id || 'guest';

  // Don't show chatbot in RootLayout if on test or mock pages
  // (those pages have their own chatbot with context)
  const isTestOrMockPage = 
    location.pathname === '/test' || 
    location.pathname === '/mock';

  return (
    <div>
      <Header />

      {navigation.state === "loading" ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      ) : (
        <Outlet />
      )}

      <Footer />
      
      {/* Show chatbot only on non-test/mock pages */}
      {!isTestOrMockPage && <Chatbot userId={userId} />}
    </div>
  );
}
export default RootLayout;
