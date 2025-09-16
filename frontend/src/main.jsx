import { createRoot } from "react-dom/client";
import "./styles.css";
import { StrictMode } from "react";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import {ThemeProvider} from "./components/ThemeProvider";
import RootLayout from "./layout/RootLayout";
import NotFound from "./components/NotFound";
import { Provider } from "react-redux";
import store from "./store/store";
import { UploadResume, About, Home, Login, Signup, TestSetup, TestPage } from "./pages/index";
import AuthLayout from "./layout/AuthLayout";
import MockPage from "./pages/MockPage";
import  MockSetUpPage from "./pages/MockSetUp";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="home" element={<Home />} />
      <Route path="about" element={<About />} />
      
      {/* Public Routes */}
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route element={<AuthLayout authentication={true} />}>
        <Route path="upload_resume" element={<UploadResume />} />
       <Route path="/test_setup" element={<TestSetup />} />
       <Route path="/test" element={<TestPage />} />
       <Route path = "/mock" element={<MockPage/>} />
       <Route path = "/mock_setup" element={<MockSetUpPage/>} />
      </Route>
      
      {/* Catch-all */}
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
    </ThemeProvider>
  </StrictMode>
);
