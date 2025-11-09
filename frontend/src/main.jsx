import { createRoot } from "react-dom/client";
import "./styles.css";
import { StrictMode } from "react";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import RootLayout from "./layout/RootLayout";
import NotFound from "./components/NotFound";
import { Provider } from "react-redux";
import store from "./store/store";
import {
  UploadResume,
  About,
  Home,
  Login,
  Signup,
  TestSetup,
  TestPage,
} from "./pages/index";
import AuthLayout from "./layout/AuthLayout";
import MockPage from "./pages/MockPage";
import MockSetUpPage from "./pages/MockSetUp";
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      {/* Default Routes */}
      <Route index element={<Home />} />
      <Route path="home" element={<Home />} />
      <Route path="about" element={<About />} />

      {/* Public Routes */}
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route element={<AuthLayout authentication={true} />}>
        <Route path="upload_resume" element={<UploadResume />} />
        <Route path="test_setup" element={<TestSetup />} />
        <Route path="test" element={<TestPage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mock" element={<MockPage />} />
        <Route path="mock_setup" element={<MockSetUpPage />} />
      </Route>

      {/* Catch-all for 404 */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="theme-ui">
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
      <ToastContainer
        position="top-right"
        autoClose={3000} // Toast auto disappears in 3 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored" // "light" | "dark" | "colored"
      />
    </ThemeProvider>
  </StrictMode>
);
