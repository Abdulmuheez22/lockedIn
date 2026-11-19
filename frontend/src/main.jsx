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

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <SignupForm /> },
      {path: "signin", element: <SignIn />},
      // { path: "signup", element: <signupForm /> },
      { path: "OtpVerification", element: <OtpVerification /> },
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
