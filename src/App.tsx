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
import Courses from "./pages/Courses";
import Blogs from "./pages/Blogs";
import SavedContent from "./pages/SavedContent";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import MFAVerification from "@/pages/MFAVerification";
import Settings from "./pages/Settings";
import InterestSelection from "./pages/InterestSelection";
import CourseDetail from "./pages/CourseDetail";
import CourseChapter from "./pages/CourseChapter";
import BlogDetail from "./pages/BlogDetail";
import ForumDetail from "./pages/ForumDetail";
// Payment System Imports
import Subscription from "./pages/Subscription";
import PaymentCheckout from "./pages/PaymentCheckout";
import PaymentVerification from "./pages/PaymentVerification";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from '@/pages/PaymentPending';
import VerifyPayment from '@/pages/VerifyPayment';
import Certificates from "@/pages/Certificates";

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
          <Route path="/verify-mfa" element={<MFAVerification />} />
          <Route path="/interests" element={<InterestSelection />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/profile-settings" element={<DashboardLayout><ProfileSettings /></DashboardLayout>} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/courses" element={<DashboardLayout><Courses /></DashboardLayout>} />
          <Route path="/community" element={<DashboardLayout><Community /></DashboardLayout>} />
          <Route path="/community/:id" element={<DashboardLayout><Community /></DashboardLayout>} />
          
          {/* Blogs list + detail */}
          <Route path="/blogs" element={<DashboardLayout><Blogs /></DashboardLayout>} />
          <Route path="/saved" element={<DashboardLayout><SavedContent /></DashboardLayout>} />
          <Route path="/messages" element={<DashboardLayout><Messages /></DashboardLayout>} />
          <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
          <Route path="/contact" element={<DashboardLayout><Contact /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
          
          {/* Course Routes */}
          <Route path="/course/:id" element={<DashboardLayout><CourseDetail /></DashboardLayout>} />
          <Route path="/course/:courseId/chapter/:chapterId" element={<DashboardLayout><CourseChapter /></DashboardLayout>} />
          
          {/* Blog Routes */}
          <Route path="/blog/:id" element={<DashboardLayout><BlogDetail /></DashboardLayout>} />

          {/* Forum Routes */}
          <Route path="/forum/:id" element={<DashboardLayout><ForumDetail /></DashboardLayout>} />
          
          {/* Payment & Subscription Routes */}
          <Route path="/subscription" element={<DashboardLayout><Subscription /></DashboardLayout>} />
          <Route path="/payment-checkout" element={<PaymentCheckout />} />
          <Route path="/payment-verification" element={<PaymentVerification />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-pending" element={<PaymentPending />} />
          <Route path="/verify-payment/:token" element={<VerifyPayment />} />
          <Route path="/certificates" element={<DashboardLayout><Certificates /></DashboardLayout>} />
          <Route path="/payment-checkout" element={<PaymentCheckout />} />


          {/* Catch-all 404 - MUST BE LAST */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;