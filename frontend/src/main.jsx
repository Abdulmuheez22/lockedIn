import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignupForm from "./components/SignupForm.jsx"
import OtpVerification from "./components/OtpVerification.jsx";
import SignIn from "./components/SignIn.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import Dashboard from "./components/Dashboard.jsx";




const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <SignupForm /> },
      { path: "register", element: <SignupForm /> },
      { path: "signin", element: <SignIn /> },
      { path: "login", element: <SignIn />  },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "OtpVerification", element: <OtpVerification /> },
      { path: "otp-verification", element: <OtpVerification /> },
      { path: "dashboard", element: <Dashboard /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
