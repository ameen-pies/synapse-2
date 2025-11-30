import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EditProfile from "./pages/EditProfile";
import ProfileSettings from "./pages/ProfileSettings";
import Contact from "./pages/Contact";
import Community from "./pages/Community";
import SavedContent from "./pages/SavedContent";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import MFAVerification from "@/pages/MFAVerification";
import Settings from "./pages/Settings";
// NEW IMPORTS FOR PAYMENT SYSTEM
import Subscription from "./pages/Subscription";
import PaymentCheckout from "./pages/PaymentCheckout";
import PaymentVerification from "./pages/PaymentVerification";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from '@/pages/PaymentPending';
import VerifyPayment from '@/pages/VerifyPayment';
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/profile-settings" element={<DashboardLayout><ProfileSettings /></DashboardLayout>} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/community" element={<DashboardLayout><Community /></DashboardLayout>} />
          <Route path="/saved" element={<DashboardLayout><SavedContent /></DashboardLayout>} />
          <Route path="/messages" element={<DashboardLayout><Messages /></DashboardLayout>} />
          <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
          <Route path="/contact" element={<DashboardLayout><Contact /></DashboardLayout>} />
          <Route path="/verify-mfa" element={<MFAVerification />} />
          <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
          
          {/* NEW PAYMENT & SUBSCRIPTION ROUTES */}
          <Route path="/subscription" element={<DashboardLayout><Subscription /></DashboardLayout>} />
          <Route path="/payment-checkout" element={<PaymentCheckout />} />
          <Route path="/payment-verification" element={<PaymentVerification />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-pending" element={<PaymentPending />} />
          <Route path="/verify-payment/:token" element={<VerifyPayment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;