import { useState, useEffect } from 'react';
import { ActivityCard } from './components/ActivityCard';
import PropertyCard from './components/PropertyCard';
import { AddToCartModal } from './components/AddToCartModal';
import { CartModal } from './components/CartModal';
import AddPropertyToCartModal from './components/AddPropertyToCartModal';
import { PropertyGallery } from './components/PropertyGallery';
import SecurityDepositCard from './components/SecurityDepositCard';
import MerchandiseShopCard from './components/MerchandiseShopCard';
import MerchandiseModal from './components/MerchandiseModal';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import PreviewModeBanner from './components/PreviewModeBanner';
import { Activity, Property } from './types';
import { supabase } from './lib/supabase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useCart } from './lib/cart-context';
import { Navigation } from './components/Navigation';
import { Success } from './pages/Success';
import { Login } from './pages/Login';
import WelcomeGuide from './pages/WelcomeGuide';
import UploadBoatingCard from './pages/UploadBoatingCard';
import { AdminPanel } from './components/AdminPanel';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';
import { Home, Anchor } from 'lucide-react';

interface SecurityDepositProduct {
  id: string;
  property_id: string;
  deposit_amount: number;
  description: string;
  active: boolean;
}

interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  image_url?: string;
  stock_quantity: number;
  active: boolean;
}

function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [securityDepositProducts, setSecurityDepositProducts] = useState<SecurityDepositProduct[]>([]);
  const [merchandiseItems, setMerchandiseItems] = useState<MerchandiseItem[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [galleryProperty, setGalleryProperty] = useState<Property | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isMerchandiseModalOpen, setIsMerchandiseModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { itemCount, addSecurityDepositItem, addMerchandiseItem } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propertiesResult, activitiesResult, securityDepositsResult, merchandiseResult] = await Promise.all([
        supabase.from('properties').select('*').eq('active', true).order('created_at'),
        supabase.from('activities').select('*').eq('active', true).order('created_at'),
        supabase.from('security_deposit_products').select('*').eq('active', true).order('created_at'),
        supabase.from('merchandise_items').select('*').eq('active', true).order('created_at'),
      ]);

      if (propertiesResult.error) throw propertiesResult.error;
      if (activitiesResult.error) throw activitiesResult.error;
      if (securityDepositsResult.error) throw securityDepositsResult.error;
      if (merchandiseResult.error) throw merchandiseResult.error;

      setProperties(propertiesResult.data || []);
      setActivities(activitiesResult.data || []);
      setSecurityDepositProducts(securityDepositsResult.data || []);
      setMerchandiseItems((merchandiseResult.data || []).map(item => ({
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyBook = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyModalOpen(true);
  };

  const handleViewGallery = (property: Property) => {
    setGalleryProperty(property);
    setIsGalleryOpen(true);
  };

  const handleAddToCart = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsAddToCartModalOpen(true);
  };

  const handleAddSecurityDeposit = async (product: SecurityDepositProduct) => {
    const property = properties.find(p => p.id === product.property_id);
    await addSecurityDepositItem({
      propertyId: product.property_id,
      propertyName: property?.name || 'Property',
      depositAmount: product.deposit_amount,
      description: product.description,
    });
    setIsCartModalOpen(true);
  };

  const handleAddMerchandise = async (item: MerchandiseItem, size: string, color: string, quantity: number) => {
    await addMerchandiseItem({
      merchandiseId: item.id,
      name: item.name,
      size,
      color,
      quantity,
      price: item.price,
      description: item.description,
    });
    setIsCartModalOpen(true);
  };

  const handleAddToCartSuccess = () => {
    setIsCartModalOpen(true);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Hero onBookNow={() => scrollToSection('rentals')} />

      <div id="rentals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Home className="w-12 h-12 text-blue-600 mr-3" />
            <h2 className="text-4xl font-bold text-gray-900">Vacation Rentals</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience Southwest Florida in style with our carefully selected vacation properties
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onBook={handlePropertyBook}
                onViewGallery={handleViewGallery}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-600">No vacation rentals available at this time.</p>
          </div>
        )}
      </div>

      <div id="activities" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Anchor className="w-12 h-12 text-cyan-600 mr-3" />
              <h2 className="text-4xl font-bold text-gray-900">Water Adventures</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From fishing charters to sunset cruises, create unforgettable memories on the water
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
          ) : activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl shadow-md">
              <p className="text-gray-600">No activities available at this time.</p>
            </div>
          )}
        </div>
      </div>

      {(securityDepositProducts.length > 0 || merchandiseItems.length > 0) && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Additional Options</h3>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Security deposits and merchandise for your perfect trip
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {securityDepositProducts.map((product) => {
                const property = properties.find(p => p.id === product.property_id);
                return (
                  <SecurityDepositCard
                    key={product.id}
                    product={product}
                    propertyName={property?.name || 'Property'}
                    onAddToCart={handleAddSecurityDeposit}
                  />
                );
              })}

              {merchandiseItems.length > 0 && (
                <MerchandiseShopCard
                  onViewMerchandise={() => setIsMerchandiseModalOpen(true)}
                  itemCount={merchandiseItems.length}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />

      <button
        onClick={() => setIsCartModalOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:from-cyan-600 hover:to-blue-700 transition-all z-40"
        title="View Cart"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
      </button>

      {isPropertyModalOpen && (
        <AddPropertyToCartModal
          property={selectedProperty}
          onClose={() => {
            setIsPropertyModalOpen(false);
            setSelectedProperty(null);
          }}
          onSuccess={() => {
            setIsPropertyModalOpen(false);
            setSelectedProperty(null);
            handleAddToCartSuccess();
          }}
        />
      )}

      {isAddToCartModalOpen && (
        <AddToCartModal
          activity={selectedActivity}
          isOpen={isAddToCartModalOpen}
          onClose={() => {
            setIsAddToCartModalOpen(false);
            setSelectedActivity(null);
          }}
          onSuccess={handleAddToCartSuccess}
        />
      )}

      {isCartModalOpen && (
        <CartModal
          isOpen={isCartModalOpen}
          onClose={() => setIsCartModalOpen(false)}
        />
      )}

      {isGalleryOpen && galleryProperty && (
        <PropertyGallery
          key={galleryProperty.id}
          property={galleryProperty}
          isOpen={isGalleryOpen}
          onClose={() => {
            setIsGalleryOpen(false);
            setGalleryProperty(null);
          }}
        />
      )}

      <MerchandiseModal
        isOpen={isMerchandiseModalOpen}
        onClose={() => setIsMerchandiseModalOpen(false)}
        items={merchandiseItems}
        onAddToCart={handleAddMerchandise}
      />
    </div>
  );
}

function AppContent() {
  const location = window.location.pathname;
  const showNavigation = location !== '/login';
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <PreviewModeBanner />
      {showNavigation && <Navigation onCartClick={() => setIsCartModalOpen(true)} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/success" element={<Success />} />
        <Route path="/welcome-guide" element={<WelcomeGuide />} />
        <Route path="/upload-boating-card" element={<UploadBoatingCard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNavigation && isCartModalOpen && (
        <CartModal
          isOpen={isCartModalOpen}
          onClose={() => setIsCartModalOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
