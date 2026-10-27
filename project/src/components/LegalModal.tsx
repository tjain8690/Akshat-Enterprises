import React, { useEffect } from 'react';
import { X, Phone, Mail, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export type LegalModalTab = 'terms' | 'privacy' | 'shipping' | 'grievance';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: LegalModalTab;
  initialTab?: LegalModalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  type,
  initialTab,
}) => {
  const currentType: LegalModalTab = type || initialTab || 'terms';

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Title based on the single requested topic
  const getTitle = () => {
    switch (currentType) {
      case 'terms':
        return 'Terms & Conditions';
      case 'privacy':
        return 'Privacy Policy';
      case 'shipping':
        return 'Shipping & Returns';
      case 'grievance':
        return 'Grievance & Business Details';
      default:
        return 'Information';
    }
  };

  return (
    <div
      className="ax-legal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="single-modal-title"
    >
      <div className="ax-legal-modal ax-legal-single-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with Title and ONLY a Cross (X) sign */}
        <div className="ax-legal-header">
          <h2 id="single-modal-title" className="ax-legal-title">
            {getTitle()}
          </h2>
          <button
            type="button"
            className="ax-legal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Pane - Shows ONLY the selected information */}
        <div className="ax-legal-body">
          {/* ── 1. TERMS & CONDITIONS ONLY ── */}
          {currentType === 'terms' && (
            <div className="ax-legal-section">
              <div className="ax-legal-badge">Akshat Enterprises • Wholesale &amp; Retail Supply</div>

              <h3>1. Commercial &amp; Wholesale Operations</h3>
              <p>
                Welcome to <strong>Akshat Enterprises</strong>. By accessing this website or placing orders through our online store, catalog, or WhatsApp ordering channel, you agree to be bound by these Terms and Conditions. Akshat Enterprises operates as a leading wholesale and retail supplier of safety shoes, jackets, gum boots, workwear, and industrial equipment based in Turbhe, Navi Mumbai, Maharashtra, India.
              </p>

              <h3>2. Multi-Size &amp; Wholesale Packing Orders</h3>
              <p>
                Our platform provides multi-size carton packing options (e.g. 6 pairs, 10 pairs, 12 pairs per carton or custom quantities per size). When ordering wholesale quantities, size assortments will be packed and dispatched according to the exact quantities selected during checkout.
              </p>

              <h3>3. Pricing, GST &amp; Invoicing</h3>
              <p>
                All prices are stated in Indian Rupees (<strong>₹ INR</strong>). In accordance with the Central Goods and Services Tax (CGST) Act, 2017, applicable GST rates are charged and reflected on the official Tax Invoice. Buyers providing a valid GSTIN are entitled to claim Input Tax Credit (ITC) under Indian tax laws.
              </p>

              <h3>4. Order Confirmation &amp; Stock Availability</h3>
              <p>
                Orders placed via our website or WhatsApp are subject to physical stock validation at our Turbhe warehouse. In case of unexpected stockouts, our sales team will contact you within 24 hours to arrange immediate alternative stock or a full refund.
              </p>

              <h3>5. Product Suitability &amp; Standards</h3>
              <p>
                Products supplied by Akshat Enterprises comply with standard industrial quality standards (such as ISI and EN specifications where stated). Customers should verify footwear and workwear specifications for their particular worksite safety requirements.
              </p>

              <h3>6. Governing Law &amp; Jurisdiction</h3>
              <p>
                All agreements, orders, and disputes shall be governed by and construed in accordance with the laws of India, subject to the exclusive jurisdiction of the competent courts in <strong>Navi Mumbai / Mumbai, Maharashtra</strong>.
              </p>
            </div>
          )}

          {/* ── 2. PRIVACY POLICY ONLY (NO DPDP) ── */}
          {currentType === 'privacy' && (
            <div className="ax-legal-section">
              <div className="ax-legal-badge">Your Privacy is Protected</div>

              <h3>1. Customer Privacy Commitment</h3>
              <p>
                Akshat Enterprises is committed to protecting the privacy and personal details of all our individual buyers and retail business partners. We collect and handle customer data transparently and securely.
              </p>

              <h3>2. Information We Collect</h3>
              <ul>
                <li><strong>Contact Details:</strong> Name, phone number, WhatsApp number, and email address.</li>
                <li><strong>Delivery &amp; Business Info:</strong> Delivery address, city, state, pin code, firm/company name, and GSTIN (for GST invoices).</li>
                <li><strong>Order Details:</strong> Products ordered, size selections, and quantities.</li>
              </ul>

              <h3>3. How We Use Your Information</h3>
              <p>
                Your information is used strictly for operational purposes:
              </p>
              <ul>
                <li>Processing, packing, and dispatching your orders.</li>
                <li>Sending order confirmation, dispatch alerts, and tracking details via WhatsApp or SMS.</li>
                <li>Generating GST-compliant tax invoices for your purchase.</li>
                <li>Providing customer support and handling size exchange requests.</li>
              </ul>

              <h3>4. Strict Policy Against Selling Data</h3>
              <p>
                <strong>We never sell, rent, trade, or share your personal or commercial data with third-party marketing companies.</strong>
              </p>
              <p>
                Data is shared only with trusted delivery partners (courier companies or transport agencies) solely to complete delivery of your parcel, and secure database services to maintain your order records.
              </p>

              <h3>5. Data Security &amp; Retention</h3>
              <p>
                We use secure, encrypted systems to safeguard your personal details against unauthorized access. Business invoices and transaction records are retained in compliance with Indian commercial and tax record retention guidelines.
              </p>

              <h3>6. Your Control Over Your Information</h3>
              <p>
                You have the right to review, update, or request deletion of your contact information at any time by contacting our support team at <strong>+91 98922 28186</strong> or emailing <strong>support@akshatenterprises.com</strong>.
              </p>
            </div>
          )}

          {/* ── 3. SHIPPING & RETURNS ONLY ── */}
          {currentType === 'shipping' && (
            <div className="ax-legal-section">
              <div className="ax-legal-badge">Fast Dispatch &amp; Easy Exchanges</div>

              <h3>1. Dispatch Timelines</h3>
              <p>
                All orders are packed and dispatched directly from our warehouse located at <strong>Shop No. 51, Janta Market, Sector-23, Turbhe, Navi Mumbai, Maharashtra 400705</strong>. Standard orders are dispatched within <strong>24 to 48 business hours</strong>.
              </p>

              <h3>2. Delivery &amp; Tracking</h3>
              <ul>
                <li><strong>Mumbai &amp; Navi Mumbai:</strong> Local courier delivery or direct in-store pickup from our Turbhe shop.</li>
                <li><strong>Maharashtra &amp; All India:</strong> Dispatched via reliable commercial transport services (e.g. V-Trans, TCI, Delhivery, Blue Dart, or customer-preferred transport for wholesale cartons).</li>
                <li><strong>Tracking:</strong> Bilty (LR) number or courier tracking link is shared directly on WhatsApp upon vehicle loading.</li>
              </ul>

              <h3>3. Wholesale Carton Inspection</h3>
              <p>
                For wholesale bulk orders, please verify the carton count and condition upon arrival. Any shortage or transit damage must be reported within <strong>48 hours of receipt</strong> with unboxing photos or video sent to our WhatsApp desk at <strong>+91 98922 28186</strong>.
              </p>

              <h3>4. 7-Day Size Exchange Policy</h3>
              <p>
                If a size does not fit, we offer a hassle-free <strong>7-Day Size Exchange</strong>:
              </p>
              <ul>
                <li>Items must be unworn, in original manufacturer condition with original tags and box intact.</li>
                <li>Replacement sizes will be dispatched promptly upon receiving the return at our Turbhe store.</li>
                <li>Customized safety jackets (with company logo screen-printing) cannot be exchanged once printed.</li>
              </ul>
            </div>
          )}

          {/* ── 4. GRIEVANCE & BUSINESS DETAILS ONLY ── */}
          {currentType === 'grievance' && (
            <div className="ax-legal-section">
              <div className="ax-legal-badge">Official Business &amp; Grievance Redressal</div>

              <h3>1. Registered Business Identity</h3>
              <div className="ax-legal-contact-card">
                <div className="contact-row">
                  <MapPin size={18} />
                  <div>
                    <strong>Legal Entity Name:</strong>
                    <span>Akshat Enterprises</span>
                  </div>
                </div>
                <div className="contact-row">
                  <MapPin size={18} />
                  <div>
                    <strong>Registered Address:</strong>
                    <span>Shop No. 51, Janta Market, Sector-23, Turbhe, Navi Mumbai, Maharashtra – 400705, India</span>
                  </div>
                </div>
                <div className="contact-row">
                  <Phone size={18} />
                  <div>
                    <strong>Contact Numbers:</strong>
                    <span>+91 98922 28186 / +91 98922 28185</span>
                  </div>
                </div>
                <div className="contact-row">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>GSTIN / Tax Registration:</strong>
                    <span>27AABFA2488R1ZM (Government of India GST Registered)</span>
                  </div>
                </div>
              </div>

              <h3>2. Grievance Redressal Officer</h3>
              <p>
                In accordance with Consumer Protection (E-Commerce) Rules and Information Technology guidelines, customer grievances and queries can be addressed directly to our Grievance Officer:
              </p>
              <div className="ax-legal-contact-card officer">
                <div className="contact-row">
                  <Mail size={18} />
                  <div>
                    <strong>Grievance Email:</strong>
                    <span><a href="mailto:grievance@akshatenterprises.com">grievance@akshatenterprises.com</a> / <a href="mailto:akshat.footwear@gmail.com">akshat.footwear@gmail.com</a></span>
                  </div>
                </div>
                <div className="contact-row">
                  <Phone size={18} />
                  <div>
                    <strong>Direct Phone:</strong>
                    <span>+91 98922 28186 (Mon – Sat, 10:30 AM to 6:30 PM IST)</span>
                  </div>
                </div>
              </div>

              <h3>3. Resolution Commitment</h3>
              <ul>
                <li><strong>Acknowledgment:</strong> Complaints are acknowledged within <strong>48 hours</strong>.</li>
                <li><strong>Resolution:</strong> Matters resolved within <strong>30 days</strong> from receipt.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
