// Force rebuild: 2026-03-12 promo code field update
import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Info, AlertTriangle, Calendar, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import type { CartItem } from '../lib/cart-context';
import { supabase } from '../lib/supabase';

interface PromoBanner {
  id: string;
  message: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalAmount: number;
  subtotal: number;
  lodgingTax: number;
  salesTax: number;
  depositAmount: number;
  onSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  totalAmount,
  subtotal,
  lodgingTax,
  salesTax,
  depositAmount,
  onSuccess: _onSuccess,
}: CheckoutModalProps) {
  console.log('🎟️ CheckoutModal RENDERED - isOpen:', isOpen);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [operatorDob, setOperatorDob] = useState('');
  const [boatingSafetyCardFile, setBoatingSafetyCardFile] = useState<File | null>(null);
  const [uploadingCard, setUploadingCard] = useState(false);
  const [boatingCompliance, setBoatingCompliance] = useState({
    has_boater_card: '',
    certification_agreed: false,
  });
  const [acknowledgments, setAcknowledgments] = useState({
    operator_age: false,
    passenger_age: false,
    backwater_only: false,
    life_jackets: false,
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoBanner, setPromoBanner] = useState<PromoBanner | null>(null);
  const [hideBanner, setHideBanner] = useState(false);

  const [autoApplyCode, setAutoApplyCode] = useState<string | null>(null);

  const fetchPromoBanner = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching promo banner:', error);
        throw error;
      }
      setPromoBanner(data);
    } catch (error) {
      console.error('Error fetching promo banner:', error);
    }
  };

  const calculateOperatorAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const hasJetSki = items.some(item =>
    item.type === 'activity' && item.activity?.name.toLowerCase().includes('jet ski')
  );

  const handleApplyPromoCode = useCallback(async (codeOverride?: string) => {
    console.log('🎟️ handleApplyPromoCode called with:', codeOverride);
    const codeToUse = codeOverride || promoCode;
    console.log('🎟️ Code to use:', codeToUse);

    if (!codeToUse.trim()) {
      setPromoMessage({ type: 'error', text: 'Please enter a promo code' });
      return;
    }

    console.log('🎟️ Starting promo code validation...');
    setApplyingPromo(true);
    setPromoMessage(null);

    try {
      const hasProperties = items.some(item => item.type === 'property');
      const hasActivities = items.some(item => item.type === 'activity');

      let bookingType = 'all';
      if (hasProperties && !hasActivities) {
        bookingType = 'properties';
      } else if (hasActivities && !hasProperties) {
        bookingType = 'activities';
      }

      const codeToValidate = codeOverride || promoCode;
      console.log('🎟️ Calling validate_promo_code with:', { code_text: codeToValidate.trim(), applies_to_type: bookingType });

      const { data, error } = await supabase.rpc('validate_promo_code', {
        code_text: codeToValidate.trim(),
        applies_to_type: bookingType
      });

      console.log('🎟️ RPC Response:', { data, error });

      if (error) {
        console.error('🎟️ RPC Error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const result = data[0];
        console.log('🎟️ Promo validation result:', result);
        if (result.valid) {
          const discountValue = parseFloat(result.discount_percentage);
          console.log('🎟️ Setting discount to:', discountValue);
          setPromoDiscount(discountValue);
          setPromoMessage({ type: 'success', text: result.message });

          // Hide banner if specific promo code is used
          const codeCheck = codeOverride || promoCode;
          if (codeCheck.trim().toUpperCase() === 'NOBANNER') {
            setHideBanner(true);
          }
        } else {
          console.log('🎟️ Code invalid:', result.message);
          setPromoDiscount(0);
          setPromoMessage({ type: 'error', text: result.message });
        }
      } else {
        console.log('🎟️ No data returned from RPC');
        setPromoDiscount(0);
        setPromoMessage({ type: 'error', text: 'Invalid promo code' });
      }
    } catch (err: any) {
      console.error('Promo code validation error:', err);
      setPromoDiscount(0);
      setPromoMessage({ type: 'error', text: 'Failed to validate promo code' });
    } finally {
      setApplyingPromo(false);
    }
  }, [items, promoCode]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCustomerEmail('');
      setCustomerName('');
      setOperatorDob('');
      setBoatingSafetyCardFile(null);
      setBoatingCompliance({
        has_boater_card: '',
        certification_agreed: false,
      });
      setAcknowledgments({
        operator_age: false,
        passenger_age: false,
        backwater_only: false,
        life_jackets: false,
      });

      setPromoDiscount(0);
      setPromoMessage(null);

      const urlParams = new URLSearchParams(window.location.search);
      const urlPromoCode = urlParams.get('promo') || urlParams.get('code') || urlParams.get('PROMO') || urlParams.get('CODE');

      console.log('🎟️ CHECKOUT OPENED - Checking URL:', window.location.href);
      console.log('🎟️ URL Params:', Object.fromEntries(urlParams));
      console.log('🎟️ Found promo code:', urlPromoCode);

      if (urlPromoCode && urlPromoCode.trim()) {
        const upperCode = urlPromoCode.toUpperCase().trim();
        console.log('🎟️ Setting promo code to:', upperCode);
        setPromoCode(upperCode);
        setAutoApplyCode(upperCode);
      } else {
        console.log('🎟️ No promo code in URL, clearing field');
        setPromoCode('');
        setAutoApplyCode(null);
      }

      // Clean up URL parameters
      if (window.location.search) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
        console.log('🎟️ Cleaned URL parameters');
      }

      fetchPromoBanner();
    } else {
      // When modal closes, force cleanup of expired bookings
      if (!isOpen) {
        supabase.rpc('cleanup_expired_bookings').then(({ error }) => {
          if (error) {
            console.error('Failed to cleanup expired bookings:', error);
          }
        });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (autoApplyCode && isOpen) {
      console.log('🎟️ Auto-applying promo code from URL:', autoApplyCode);
      const timer = setTimeout(() => {
        handleApplyPromoCode(autoApplyCode);
        setAutoApplyCode(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoApplyCode, isOpen]);

  const discountAmount = (subtotal * promoDiscount) / 100;
  const finalTotal = Math.max(0, totalAmount - discountAmount);

  console.log('💰 Discount Calculation:', {
    promoDiscount,
    subtotal,
    discountAmount,
    totalAmount,
    finalTotal
  });

  const handleCheckout = async () => {
    console.log('🚀 [CHECKOUT] Button clicked - starting checkout process');
    console.log('🚀 [CHECKOUT] Customer:', { customerEmail, customerName });
    console.log('🚀 [CHECKOUT] Has Jet Ski:', hasJetSki);

    if (!customerEmail || !customerName) {
      console.log('❌ [CHECKOUT] Missing email or name');
      setError('Please enter your name and email');
      return;
    }

    // Validate jet ski compliance
    if (hasJetSki) {
      console.log('🛟 [CHECKOUT] Validating jet ski compliance...');
      if (!operatorDob) {
        console.log('❌ [CHECKOUT] Missing operator DOB');
        setError('Operator date of birth is required for jet ski rentals');
        return;
      }

      const operatorAge = calculateOperatorAge(operatorDob);
      console.log('🛟 [CHECKOUT] Operator age:', operatorAge);
      if (operatorAge < 14) {
        console.log('❌ [CHECKOUT] Operator too young');
        setError('Operator must be at least 14 years old to operate a jet ski');
        return;
      }

      const bornAfter1988 = new Date(operatorDob) >= new Date('1988-01-01');
      console.log('🛟 [CHECKOUT] Born after 1988:', bornAfter1988);

      if (bornAfter1988) {
        if (!boatingCompliance.has_boater_card) {
          console.log('❌ [CHECKOUT] Boater card status not indicated');
          setError('Please indicate if you have a Boating Safety Education Card');
          return;
        }

        if (boatingCompliance.has_boater_card === 'no') {
          console.log('❌ [CHECKOUT] No boater card');
          setError('Florida law requires a Boating Safety Education Card for operators born on or after January 1, 1988');
          return;
        }

        if (!boatingSafetyCardFile) {
          console.log('❌ [CHECKOUT] No boating card file uploaded');
          setError('Please upload your Boating Safety Education Card');
          return;
        }
      }

      if (!boatingCompliance.certification_agreed) {
        console.log('❌ [CHECKOUT] Certification not agreed');
        setError('You must certify that the information provided is true and accurate');
        return;
      }

      if (!acknowledgments.operator_age || !acknowledgments.passenger_age ||
          !acknowledgments.backwater_only || !acknowledgments.life_jackets) {
        console.log('❌ [CHECKOUT] Missing acknowledgments', acknowledgments);
        setError('Please confirm all required acknowledgments');
        return;
      }
      console.log('✅ [CHECKOUT] All jet ski validations passed');
    }

    console.log('⏳ [CHECKOUT] Setting loading state...');
    setIsLoading(true);
    setError(null);

    try {
      let boatingSafetyCardUrl = null;

      // Upload boating safety card if provided
      if (hasJetSki && boatingSafetyCardFile) {
        console.log('📤 [CHECKOUT] Uploading boating safety card...');
        setUploadingCard(true);
        const fileExt = boatingSafetyCardFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('boating-cards')
          .upload(fileName, boatingSafetyCardFile);

        if (uploadError) {
          console.error('❌ [CHECKOUT] Upload error:', uploadError);
          throw new Error('Failed to upload boating safety card');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('boating-cards')
          .getPublicUrl(uploadData.path);

        boatingSafetyCardUrl = publicUrl;
        console.log('✅ [CHECKOUT] Card uploaded:', publicUrl);
        setUploadingCard(false);
      }

      const promoPayload = {
        promoCode: promoDiscount > 0 ? promoCode.trim() : undefined,
        promoDiscount: promoDiscount > 0 ? promoDiscount : undefined,
      };

      console.log('🎟️ [CHECKOUT] SENDING TO STRIPE:', {
        promoCode: promoPayload.promoCode,
        promoDiscount: promoPayload.promoDiscount,
        discountAmount,
        finalTotal,
      });

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`;
      console.log('🌐 [CHECKOUT] API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customerEmail,
          customerName,
          lodgingTax,
          salesTax,
          operatorDob: hasJetSki ? operatorDob : undefined,
          boatingSafetyCardUrl: boatingSafetyCardUrl || undefined,
          acknowledgments: hasJetSki ? acknowledgments : undefined,
          ...promoPayload,
        }),
      });

      console.log('📡 [CHECKOUT] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [CHECKOUT] Checkout session error:', errorData);
        throw new Error(errorData.error || `Failed to create checkout session (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ [CHECKOUT] Response data:', data);

      if (data.url) {
        console.log('🔗 [CHECKOUT] Opening Stripe URL:', data.url);
        const stripeWindow = window.open(data.url, '_blank');

        if (!stripeWindow) {
          console.log('❌ [CHECKOUT] Popup blocked');
          setError('Please allow popups for this site to complete payment');
          setIsLoading(false);
          return;
        }

        console.log('✅ [CHECKOUT] Stripe window opened, closing modal');
        onClose();
        setIsLoading(false);
      } else {
        console.log('❌ [CHECKOUT] No checkout URL in response');
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('❌ [CHECKOUT] Checkout error:', err);
      setError(err.message || 'Failed to initialize payment');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log('🎟️ Backdrop clicked - closing modal');
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => {
          console.log('🎟️ Inner modal clicked - preventing close');
          e.stopPropagation();
        }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Secure Checkout</h2>
            <div className="text-xs text-gray-400 mt-0.5">v2026.03.12.1911</div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>


        <div className="p-6">
          <div className="space-y-6">

            {items.some(item => item.type === 'property') && (
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-lg">
                    $
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-900 text-base mb-1">
                      $500 Security Deposit Authorization (Hold)
                    </h3>
                    <p className="text-yellow-800 text-sm leading-relaxed">
                      Your cart includes vacation rental(s). A $500 hold will be placed on your card but NOT charged. The hold will be automatically released after checkout if there are no damages.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>

             
              <div className="pt-2"></div>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.type === 'activity'
                      ? `${item.activity?.name} - ${item.numPeople} ${item.numPeople === 1 ? 'person' : 'people'}`
                      : `${item.property?.name} - ${item.guests} ${item.guests === 1 ? 'guest' : 'guests'}`
                    }
                  </span>
                  <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                </div>
              ))}
              {(depositAmount > 0 || lodgingTax > 0 || salesTax > 0) && (
                <>
                  <div className="pt-2 border-t border-gray-200 flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  {salesTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Sales Tax (6.5%)</span>
                      <span className="font-medium text-gray-900">${salesTax.toFixed(2)}</span>
                    </div>
                  )}
                  {lodgingTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Lodging Tax (11.5%)</span>
                      <span className="font-medium text-gray-900">${lodgingTax.toFixed(2)}</span>
                    </div>
                  )}
                  {depositAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-700 font-medium">Security Deposit (Hold - Not Charged)</span>
                      <span className="font-medium text-yellow-700">${depositAmount.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              {promoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-700 font-medium">Promo Discount ({promoDiscount}%)</span>
                  <span className="font-medium text-green-700">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-3 border-t-2 border-gray-300 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-blue-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* 🎯 PROMO CODE SECTION - HIGHLY VISIBLE */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-4 border-green-500 rounded-2xl p-6 shadow-lg ring-4 ring-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-gray-900 text-xl">Have a Promo Code?</h3>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="ENTER YOUR CODE HERE"
                    disabled={promoDiscount > 0}
                    className="w-full px-5 py-4 border-3 border-gray-400 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500 uppercase font-bold text-lg tracking-wide"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyPromoCode()}
                  disabled={!promoCode.trim() || promoDiscount > 0 || applyingPromo}
                  className="px-8 py-4 bg-green-600 text-white font-black text-lg rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  {applyingPromo ? 'Applying...' : promoDiscount > 0 ? 'Applied ✓' : 'APPLY'}
                </button>
              </div>

              {promoMessage && promoMessage.type === 'error' && (
                <div className="mt-4 flex items-start gap-3 text-base text-red-700 bg-red-50 border-2 border-red-300 rounded-xl p-4 font-semibold">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{promoMessage.text}</span>
                </div>
              )}

              {promoMessage && promoMessage.type === 'success' && promoDiscount > 0 && (
                <div className="mt-4 flex items-start gap-3 text-base text-green-800 bg-green-100 border-2 border-green-400 rounded-xl p-4 font-bold">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>Promo code applied! You saved {promoDiscount}% (${discountAmount.toFixed(2)})</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>

              {hasJetSki && (
                <>
                  <div className="bg-gray-900 text-white rounded-xl p-5 mt-6">
                    <h3 className="font-bold text-lg mb-3">Age & Identification Requirements</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>Operators must be at least 14 years old</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>Renters must be at least 18 years old</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>Valid photo ID required</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>Boating safety compliance required before operation</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Jet Ski Operator Requirements
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Your cart includes a jet ski rental. Florida law requires the following compliance information.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="operator-dob" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 text-cyan-600" />
                          Operator Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="operator-dob"
                          required={hasJetSki}
                          value={operatorDob}
                          onChange={(e) => setOperatorDob(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                          max={new Date().toISOString().split('T')[0]}
                        />
                        {operatorDob && calculateOperatorAge(operatorDob) < 14 && (
                          <p className="text-sm text-red-600 mt-1 font-medium">
                            Operator must be at least 14 years old
                          </p>
                        )}
                        {operatorDob && calculateOperatorAge(operatorDob) >= 14 && (
                          <p className="text-sm text-green-600 mt-1">
                            Operator age: {calculateOperatorAge(operatorDob)} years
                          </p>
                        )}
                      </div>

                      {operatorDob && new Date(operatorDob) >= new Date('1988-01-01') && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Do you currently possess a valid Boating Safety Education Card? <span className="text-red-500">*</span>
                            </label>
                            <select
                              required={hasJetSki}
                              value={boatingCompliance.has_boater_card}
                              onChange={(e) => setBoatingCompliance({ ...boatingCompliance, has_boater_card: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                            >
                              <option value="">Select</option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>

                          {boatingCompliance.has_boater_card === 'yes' && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Upload Your Boating Safety Card <span className="text-red-500">*</span>
                              </label>
                              <div className="border-2 border-dashed border-cyan-300 rounded-lg p-4 bg-white">
                                <input
                                  type="file"
                                  required={hasJetSki}
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setBoatingSafetyCardFile(file);
                                    }
                                  }}
                                  className="w-full text-sm text-gray-700"
                                />
                                {boatingSafetyCardFile && (
                                  <p className="text-sm text-green-600 mt-2 font-medium">
                                    ✓ Card uploaded: {boatingSafetyCardFile.name}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                  Accepted formats: JPG, PNG, PDF
                                </p>
                              </div>
                            </div>
                          )}

                          {boatingCompliance.has_boater_card === 'no' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <p className="text-sm text-red-700 font-medium mb-3">
                                Florida law requires a Boating Safety Education Card for operators born on or after January 1, 1988.
                                You must obtain this card before you can rent a jet ski.
                              </p>
                              <div className="space-y-2 text-sm text-red-700">
                                <p>
                                  <strong>Option 1:</strong> Get your card now at{' '}
                                  <a href="https://takemyboattest.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-red-900">
                                    takemyboattest.com
                                  </a>
                                </p>
                                <p>
                                  <strong>Option 2:</strong> Already have your card?{' '}
                                  <a href="/upload-boating-card" className="underline font-semibold hover:text-red-900">
                                    Upload it here
                                  </a>
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            required={hasJetSki}
                            checked={boatingCompliance.certification_agreed}
                            onChange={(e) => setBoatingCompliance({ ...boatingCompliance, certification_agreed: e.target.checked })}
                            className="mt-1 w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            I certify that the information provided is true and accurate. I understand that Florida law requires boating safety education to operate a personal watercraft.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      Required Acknowledgments
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required={hasJetSki}
                          checked={acknowledgments.operator_age}
                          onChange={(e) => setAcknowledgments({ ...acknowledgments, operator_age: e.target.checked })}
                          className="mt-1 w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">
                          I confirm the operator is 14 years or older.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required={hasJetSki}
                          checked={acknowledgments.passenger_age}
                          onChange={(e) => setAcknowledgments({ ...acknowledgments, passenger_age: e.target.checked })}
                          className="mt-1 w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">
                          I confirm any passenger is at least 6 years old, fits properly in a USCG-approved life jacket, and can hold on independently.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required={hasJetSki}
                          checked={acknowledgments.backwater_only}
                          onChange={(e) => setAcknowledgments({ ...acknowledgments, backwater_only: e.target.checked })}
                          className="mt-1 w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">
                          I understand this rental is backwater only and not for open Gulf use.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required={hasJetSki}
                          checked={acknowledgments.life_jackets}
                          onChange={(e) => setAcknowledgments({ ...acknowledgments, life_jackets: e.target.checked })}
                          className="mt-1 w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-700">
                          I understand life jackets are required and provided, and must be worn at all times.
                        </span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {items.some(item => item.type === 'property') && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-xs text-gray-600">
                <p className="font-semibold text-gray-800 mb-2">Rental Terms & Conditions:</p>
                <p className="leading-relaxed">
                  By completing this booking, you agree to our rental policies including check-in/check-out times, property rules, and security deposit terms. A $500 authorization hold will be placed on your card but will not be charged unless damages occur.
                </p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading || uploadingCard || !customerEmail || !customerName}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploadingCard ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading Document...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting to secure checkout...
                </>
              ) : (
                'Proceed to Secure Checkout'
              )}
            </button>

            <p className="text-xs text-center text-gray-500">
              You will be redirected to Stripe's secure payment page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
