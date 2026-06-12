import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import WorkOrders from "./pages/WorkOrders";
import Analytics from "./pages/Analytics";
import Audit from "./pages/Audit";

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/workorders" element={<WorkOrders />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/audit" element={<Audit />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
