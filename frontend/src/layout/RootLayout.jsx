import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { Outlet, useNavigation } from "react-router-dom";

function RootLayout() {
  const navigation = useNavigation();

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
    </div>
  );
}

export default RootLayout;
