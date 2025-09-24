import { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { restoreAuthFromStorage } from "./store/slices/authSlice";
import Layout from "./layout/Layout";
import MobileFiltersApp from "./pages/MobileFiltersApp";
import AdvancedMobileFiltersApp from "./pages/AdvancedMobileFiltersApp";

// Import AuthFlow component and ProtectedRoute
import AuthFlow from "./screens/AuthFlow";
import ProtectedRoute from "./components/ProtectedRoute";

// Import demo components
import ProfileModalDemo from "./components/ProfileModalDemo";
import SimpleModalTest from "./components/SimpleModalTest";

// Import all page components
import MainDashboard from "./pages/MainDashboard";
import DashboardView from "./pages/dashboardview";
import DashboardAnalyticsGoogleReport from "./pages/dashboardanalyticsgooglereport";
import DashboardMarketplaceSync from "./pages/dashboardmarketplacesync";
import DashboardUsers from "./pages/dashboardusers";
import DashboardOrders from "./pages/dashboardorders";
import DashboardProductData from "./pages/dashboardproductdata";
import Orders from "./pages/Orders"; // Old Orders component (fallback)
import OrdersNew from "./pages/OrdersNew"; // New Redux Orders component
import OrderDetails from "./pages/OrderDetails"; // Old OrderDetails component (fallback)
import OrderDetailsNew from "./pages/OrderDetailsNew"; // New Redux OrderDetails component
import ReturnOrders from "./pages/ReturnOrders"; // Old ReturnOrders component (fallback)
import ReturnOrdersNew from "./pages/ReturnOrdersNew"; // New Redux ReturnOrders component
import ExchangeOrders from "./pages/ExchangeOrders"; // New Exchange Orders component
import Inbox from "./pages/Inbox";
import Users from "./pages/Users";
import BlockUser from "./pages/BlockUser";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Products from "./pages/Products";
import UploadCategory from "./pages/UploadCategory";
import UploadCategorySimple from "./pages/UploadCategorySimple";
import SubCategory from "./pages/SubCategory";
import SingleProductUpload from "./components/SingleProductUpload";
import ItemManagementSingleProductUpload from "./pages/itemmanagementsingleproductupload";
import ItemManagementEditPage from "./pages/itemmanagementeditpage";
import ItemManagementBulkUpload from "./pages/itemmanagementbulkupload";
import ItemManagement from "./pages/ItemManagement";
import ManageReviews from "./pages/ManageReviews";
import ReviewDetails from "./pages/ReviewDetails";
import PushNotification from "./pages/pushNotification";
import NotificationPreview from "./pages/notificationPreview";
import SendNotificationInApp from "./pages/sendnotificationinapp";
import BulkSMS from "./pages/BulkSMS";
import InviteAFriend from "./pages/inviteafriend";
import Points from "./pages/points";
import PromoCodeManagement from "./pages/PromoCodeManagement";
import CartAbandonmentRecovery from "./pages/CartAbandonmentRecovery";
import Filters from "./pages/Filters";
import JoinUsControl from "./pages/JoinUsControl";
import ManageBannersOnRewards from "./pages/ManageBannersOnRewards";
import ProductBundling from "./pages/itembundling";
import APIDebugPage from "./pages/APIDebugPage";
import APIDebugTest from "./pages/APIDebugTest";
import ArrangementControl from "./pages/itemarrangementcontrol";
import NewPartner from "./pages/NewPartner";

import FaqManagement from "./pages/FaqManagement";
import CollectCommunicationPreferences from "./pages/Collect communication preferences";
import CollectProfileVisibilityData from "./pages/collect Profile visibility data";
import CollectLocationData from "./pages/collectlocationdata";
import GetAutoInvoiceMailing from "./pages/get auto invoice mailing";
import HuggingFaceApiOpenClose from "./pages/hugging face api open close";
import Profile from "./pages/Profile";
import EmailAndSmsTemplateManagementScreenPage from "./pages/emailandsmstempalatemanagementscreenpage";
import SaveForLaterPage from "./pages/SaveForLaterPage";
import SaveForLaterExamples from "./components/SaveForLaterExamples";

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Restore authentication from localStorage on app startup
  useEffect(() => {
    dispatch(restoreAuthFromStorage());
    // Add a small delay to ensure auth state is properly restored
    setTimeout(() => {
      setIsInitialized(true);
    }, 100);
  }, [dispatch]);

  // Show loading spinner while app is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Root route - always redirect to auth first */}
        <Route 
          path="/" 
          element={<Navigate to="/auth" replace />}
        />

        {/* ===== AUTHENTICATION ROUTES (without Layout) ===== */}
        <Route path="/auth" element={<AuthFlow />} />



        {/* ===== DEMO ROUTES ===== */}
        <Route path="/profile-modal-demo" element={<ProfileModalDemo />} />
        <Route path="/simple-modal-test" element={<SimpleModalTest />} />

        {/* Mobile Filters App - standalone route without Layout */}
        <Route path="/mobile-filters-app" element={<MobileFiltersApp />} />

        {/* Advanced Mobile Filters App - enhanced desktop management interface */}
        <Route
          path="/advanced-mobile-filters"
          element={<AdvancedMobileFiltersApp />}
        />

        {/* Dashboard route without layout for now */}
        <Route path="/dashboard" element={
          <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the admin panel!</p>
            <MainDashboard />
          </div>
        } />

        {/* All admin routes wrapped in Layout and protected */}
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* ===== DASHBOARD & MAIN ===== */}
          <Route path="/admin-dashboard" element={<MainDashboard />} />
          <Route path="/database" element={<MainDashboard activeTab="databaseDashboard" />} />
          
          {/* ===== NEW DASHBOARD COMPONENTS ===== */}
          <Route path="/dashboard-overview" element={<DashboardView />} />
          <Route path="/analytics-reports" element={<DashboardAnalyticsGoogleReport />} />
          <Route path="/marketplace-sync" element={<DashboardMarketplaceSync />} />
          <Route path="/user-management" element={<DashboardUsers />} />
          <Route path="/order-management" element={<DashboardOrders />} />
          <Route path="/product-data" element={<DashboardProductData />} />

          {/* ===== ORDER MANAGEMENT ===== */}
          <Route path="/orders" element={<OrdersNew />} />
          <Route path="/orders-old" element={<Orders />} /> {/* Fallback to old component */}
          <Route path="/order-details/:orderId" element={<OrderDetailsNew />} />
          <Route path="/order-details-old/:orderId" element={<OrderDetails />} /> {/* Fallback to old component */}
          <Route path="/return-orders" element={<ReturnOrdersNew />} />
          <Route path="/return-orders-old" element={<ReturnOrders />} /> {/* Fallback to old component */}
          <Route path="/exchange-orders" element={<ExchangeOrders />} /> {/* New Exchange Orders */}

          {/* Chat Messages */}
          <Route path="/inbox" element={<Inbox />} />

          {/* ===== PRODUCT MANAGEMENT ===== */}
          <Route path="/item-management" element={<ItemManagement />} />
          <Route path="/item-management/edit/:id" element={<ItemManagementEditPage />} />
          <Route path="/item-management-bulk-upload" element={<ItemManagementBulkUpload />} />
          <Route path="/admin/products" element={<ItemManagement />} />
          <Route path="/admin/products/new" element={<ItemManagement />} />
          <Route path="/admin/products/edit/:id" element={<ItemManagementEditPage />} />
          <Route path="/admin/products/view/:id" element={<ItemManagement />} />

          <Route path="/products" element={<Products />} />
          
          {/* ===== SAVE FOR LATER ===== */}
          <Route path="/save-for-later" element={<SaveForLaterPage />} />
          <Route path="/save-for-later-examples" element={<SaveForLaterExamples />} />
          <Route path="/upload-category" element={<UploadCategory />} />
          <Route path="/upload-category-simple" element={<UploadCategorySimple />} />
          <Route path="/subcategory" element={<SubCategory />} />
          <Route
            path="/single-product-upload"
            element={<SingleProductUpload />}
          />
          <Route
            path="/upload-product"
            element={<ItemManagementSingleProductUpload />}
          />
          <Route
            path="/upload-product/:id"
            element={<ItemManagementSingleProductUpload />}
          />
          <Route
            path="/single-product-upload-complex"
            element={<SingleProductUpload />}
          />


          {/* ===== REVIEWS & RATINGS ===== */}
          <Route path="/manage-reviews" element={<ManageReviews />} />
          <Route path="/api-debug-test" element={<APIDebugTest />} />
          <Route path="/review-details" element={<ReviewDetails />} />          {/* ===== USER MANAGEMENT ===== */}
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/block-user" element={<BlockUser />} />

          {/* ===== COMMUNICATION & NOTIFICATIONS ===== */}
          <Route path="/push-notification" element={<PushNotification />} />
          <Route
            path="/notification-preview"
            element={<NotificationPreview />}
          />
          <Route
            path="/in-app-notification"
            element={<SendNotificationInApp />}
          />
          <Route path="/bulk-messages" element={<BulkSMS />} />

          {/* ===== MARKETING & PROMOTIONS ===== */}
          <Route path="/invite" element={<InviteAFriend />} />
          <Route path="/points" element={<Points />} />
          <Route
            path="/promo-code-management"
            element={<PromoCodeManagement />}
          />
          <Route path="/cart-recovery" element={<CartAbandonmentRecovery />} />

          {/* ===== APP FUNCTIONAL AREA ===== */}
          <Route path="/filters" element={<Filters />} />
          <Route path="/join-control" element={<JoinUsControl />} />
          <Route
            path="/manage-banners-rewards"
            element={<ManageBannersOnRewards />}
          />
          <Route path="/bundling" element={<ProductBundling />} />
          <Route path="/api-debug" element={<APIDebugPage />} />
          <Route path="/arrangement" element={<ArrangementControl />} />
          <Route path="/new-partner" element={<NewPartner />} />

          {/* ===== DATA MANAGEMENT & COLLECTION ===== */}
          <Route path="/faq-management" element={<FaqManagement />} />
          <Route
            path="/collect-communication-preferences"
            element={<CollectCommunicationPreferences />}
          />
          <Route
            path="/collect-profile-visibility"
            element={<CollectProfileVisibilityData />}
          />
          <Route
            path="/collect-location-data"
            element={<CollectLocationData />}
          />
          <Route
            path="/auto-invoice-mailing"
            element={<GetAutoInvoiceMailing />}
          />
          <Route
            path="/hugging-face-api"
            element={<HuggingFaceApiOpenClose />}
          />

          {/* ===== ANALYTICS & REPORTS ===== */}
          <Route path="/analytics" element={<Analytics />} />

          {/* ===== SETTINGS & CONFIGURATION ===== */}
          <Route path="/settings" element={<Settings />} />

          {/* ===== SETTINGS SUB-ROUTES ===== */}
          <Route
            path="/settings/communication-preferences"
            element={<CollectCommunicationPreferences />}
          />
          <Route
            path="/settings/profile-visibility"
            element={<CollectProfileVisibilityData />}
          />
          <Route
            path="/settings/location-data"
            element={<CollectLocationData />}
          />
          <Route
            path="/settings/auto-invoice"
            element={<GetAutoInvoiceMailing />}
          />
          <Route
            path="/settings/hugging-face"
            element={<HuggingFaceApiOpenClose />}
          />
          <Route
            path="/settings/email-sms-templates"
            element={<EmailAndSmsTemplateManagementScreenPage />}
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
