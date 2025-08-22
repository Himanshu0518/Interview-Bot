import React from "react";
import { Outlet } from "react-router-dom";
import Protected from "../components/Protected";

export default function AuthLayout({ authentication = true }) {
  return (
    <Protected authentication={authentication}>
      <Outlet />
    </Protected>
  );
}
