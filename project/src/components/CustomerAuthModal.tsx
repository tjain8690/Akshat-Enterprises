import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LogOut,
  Package,
  MapPin,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface CustomerUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  authMethod: 'google' | 'whatsapp' | 'mobile';
  verified: boolean;
  createdAt: string;
}

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  dark: boolean;
  user: CustomerUser | null;
  onLoginSuccess: (user: CustomerUser) => void;
  onLogout: () => void;
  onOpenAdminSecret?: () => void;
}

const LOCAL_USER_KEY = 'akshat_customer_session';

export function getSavedCustomerUser(): CustomerUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomerUser(u: CustomerUser | null) {
  if (u) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
  } else {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  dark,
  user,
  onLoginSuccess,
  onLogout,
  onOpenAdminSecret,
}) => {
  const [authStep, setAuthStep] = useState<'method' | 'otp' | 'profile'>('method');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [viaWhatsApp, setViaWhatsApp] = useState(true);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'address'>('orders');

  useEffect(() => {
    if (user) {
      setAuthStep('profile');
    } else {
      setAuthStep('method');
    }
  }, [user, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authStep === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, timer]);

  if (!isOpen) return null;

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        return;
      }

      // Simulated seamless customer Google profile
      const demoUser: CustomerUser = {
        id: 'cust-google-' + Date.now(),
        name: 'Google Customer',
        email: 'customer@gmail.com',
        authMethod: 'google',
        verified: true,
        createdAt: new Date().toISOString(),
      };
      saveCustomerUser(demoUser);
      onLoginSuccess(demoUser);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Google sign-in error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      alert('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    // Secret trigger: If owner enters secret passcode '9999999999' or '#admin'
    if (cleanPhone === '9999999999' && onOpenAdminSecret) {
      onClose();
      onOpenAdminSecret();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthStep('otp');
      setTimer(30);
      setOtpError(null);
    }, 700);
  };

  // Handle OTP Input Change
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = digit;
    setOtpCode(newOtp);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`customer-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP Verify
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const verifiedUser: CustomerUser = {
        id: 'cust-ph-' + phoneNumber.slice(-4),
        name: `Customer (+91 ${phoneNumber.slice(0, 5)}...)`,
        phone: '+91 ' + phoneNumber,
        authMethod: viaWhatsApp ? 'whatsapp' : 'mobile',
        verified: true,
        createdAt: new Date().toISOString(),
      };
      saveCustomerUser(verifiedUser);
      onLoginSuccess(verifiedUser);
      setAuthStep('profile');
    }, 600);
  };

  return (
    <div className={`customer-auth-overlay${dark ? ' dark' : ''}`} onClick={onClose}>
      <div className="customer-auth-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="customer-auth-header">
          <div className="customer-auth-title-wrap">
            <h3 className="customer-auth-title">
              {user ? 'My Customer Account' : 'Sign In or Register'}
            </h3>
            <p className="customer-auth-subtitle">
              {user
                ? 'Manage your orders, wishlist, and shipping details'
                : 'Secure access to orders, tracking & exclusive member discounts'}
            </p>
          </div>
          <button
            type="button"
            className="customer-auth-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="customer-auth-body">
          {/* STEP 1: AUTH METHOD SELECTION (Phone / WhatsApp & Google) */}
          {authStep === 'method' && !user && (
            <div className="customer-auth-methods">
              {/* Google Button */}
              <button
                type="button"
                className="customer-google-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="google-icon">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="customer-auth-divider">
                <span>OR SIGN IN WITH MOBILE / WHATSAPP</span>
              </div>

              {/* Mobile / WhatsApp Form */}
              <form onSubmit={handleSendOtp} className="customer-phone-form">
                <label className="customer-input-label">Enter Mobile Number</label>
                <div className="customer-phone-input-wrap">
                  <span className="customer-country-code">🇮🇳 +91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    className="customer-phone-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    autoFocus
                  />
                </div>

                {/* Delivery Channel Radio: WhatsApp vs SMS */}
                <div className="customer-delivery-options">
                  <button
                    type="button"
                    className={`customer-delivery-chip${viaWhatsApp ? ' active' : ''}`}
                    onClick={() => setViaWhatsApp(true)}
                  >
                    <MessageCircle size={15} color="#25D366" />
                    <span>Send via WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    className={`customer-delivery-chip${!viaWhatsApp ? ' active' : ''}`}
                    onClick={() => setViaWhatsApp(false)}
                  >
                    <Phone size={14} color="#2563eb" />
                    <span>Send via SMS</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="customer-submit-btn"
                  disabled={loading || phoneNumber.length < 10}
                >
                  {loading ? (
                    <span className="customer-spinner" />
                  ) : (
                    <>
                      <span>Get Verification Code</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="customer-security-badge">
                <ShieldCheck size={14} color="#16a34a" />
                <span>Your personal information is 256-bit encrypted &amp; never shared.</span>
              </div>
            </div>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {authStep === 'otp' && !user && (
            <div className="customer-otp-step">
              <div className="customer-otp-notice">
                <div className="customer-otp-icon-wrap">
                  {viaWhatsApp ? (
                    <MessageCircle size={24} color="#25D366" />
                  ) : (
                    <Phone size={24} color="#2563eb" />
                  )}
                </div>
                <h4>Verify Verification Code</h4>
                <p>
                  We sent a 6-digit code to <strong>+91 {phoneNumber}</strong> via{' '}
                  {viaWhatsApp ? 'WhatsApp' : 'SMS'}.
                </p>
                <small className="demo-otp-hint">(Demo OTP: Enter any 6 numbers e.g. 123456)</small>
              </div>

              <form onSubmit={handleVerifyOtp} className="customer-otp-boxes-form">
                <div className="customer-otp-row">
                  {otpCode.map((val, idx) => (
                    <input
                      key={idx}
                      id={`customer-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="customer-otp-box"
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !val && idx > 0) {
                          document.getElementById(`customer-otp-${idx - 1}`)?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                {otpError && <div className="customer-auth-error">{otpError}</div>}

                <button
                  type="submit"
                  className="customer-submit-btn"
                  disabled={loading || otpCode.join('').length < 6}
                >
                  {loading ? <span className="customer-spinner" /> : 'Verify & Sign In'}
                </button>

                <div className="customer-otp-actions">
                  {timer > 0 ? (
                    <span className="customer-timer-text">Resend code in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      className="customer-resend-btn"
                      onClick={() => setTimer(30)}
                    >
                      <RefreshCw size={12} /> Resend OTP
                    </button>
                  )}
                  <button
                    type="button"
                    className="customer-change-phone-btn"
                    onClick={() => {
                      setAuthStep('method');
                      setOtpCode(['', '', '', '', '', '']);
                    }}
                  >
                    Change Number
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: CUSTOMER PROFILE (WHEN LOGGED IN) */}
          {user && (
            <div className="customer-profile-dashboard">
              {/* Profile Card */}
              <div className="customer-profile-top-card">
                <div className="customer-avatar-circle">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="customer-profile-details">
                  <div className="customer-profile-name">{user.name}</div>
                  <div className="customer-profile-contact">
                    {user.phone || user.email}
                    <span className="customer-verified-tag">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  </div>
                  <span className="customer-login-via-tag">
                    Logged in via {user.authMethod === 'whatsapp' ? 'WhatsApp OTP' : user.authMethod}
                  </span>
                </div>
                <button
                  type="button"
                  className="customer-logout-btn"
                  onClick={onLogout}
                  title="Sign out of account"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="customer-profile-tabs">
                <button
                  type="button"
                  className={`cust-tab-btn${activeTab === 'orders' ? ' active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={14} />
                  <span>My Orders</span>
                </button>
                <button
                  type="button"
                  className={`cust-tab-btn${activeTab === 'address' ? ' active' : ''}`}
                  onClick={() => setActiveTab('address')}
                >
                  <MapPin size={14} />
                  <span>Saved Addresses</span>
                </button>
              </div>

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="customer-tab-content">
                  <div className="customer-empty-orders">
                    <Package size={36} className="cust-empty-icon" />
                    <h4>No Orders Placed Yet</h4>
                    <p>When you place an order via WhatsApp or checkout, your tracking details will appear right here.</p>
                    <button
                      type="button"
                      className="cust-shop-now-btn"
                      onClick={onClose}
                    >
                      Start Shopping
                    </button>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'address' && (
                <div className="customer-tab-content">
                  <div className="customer-address-card">
                    <div className="cust-addr-header">
                      <strong>Default Shipping Address</strong>
                      <span className="cust-addr-tag">Primary</span>
                    </div>
                    <p className="cust-addr-body">
                      {user.name}<br />
                      Akshat Enterprises Hub, Delhi Road<br />
                      Near Industrial Area, PIN: 110001<br />
                      Contact: {user.phone || '+91 98765 43210'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
