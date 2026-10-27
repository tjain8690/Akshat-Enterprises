import { useState } from 'react';
import { MapPin, Phone, MessageCircle, Instagram } from 'lucide-react';
import { whatsappLink } from '../constants';
import { Link } from 'react-router-dom';
import { LegalModal, LegalModalTab } from './LegalModal';

interface FooterProps {
  onOpenLegal?: (tab: LegalModalTab) => void;
}

export function Footer({ onOpenLegal }: FooterProps) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [internalTab, setInternalTab] = useState<LegalModalTab>('terms');

  const handleOpen = (tab: LegalModalTab) => {
    if (onOpenLegal) {
      onOpenLegal(tab);
    } else {
      setInternalTab(tab);
      setInternalModalOpen(true);
    }
  };

  return (
    <>
      <div className="trust-strip">
        <div className="trust-item">
          <strong>100% Authentic</strong>
          <span>Direct from brands</span>
        </div>
        <div className="trust-item">
          <strong>Try before buy</strong>
          <span>Visit our Turbhe store</span>
        </div>
        <div className="trust-item">
          <strong>Bulk pricing</strong>
          <span>Special rates for bulk orders</span>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="brand" aria-label="Akshat Enterprises Home">
              <img src="/Akshat_logo_reversed.png" alt="Akshat Enterprises" className="site-footer-logo-img" />
            </Link>
            <p>Wholesalers of safety shoes, jackets,<br />caps, gum boots &amp; workwear.</p>
          </div>
          <div className="footer-contact">
            <span>Have a question?</span>
            <a href={`tel:9892228186`}><Phone size={16} /> 98922 28186</a>
            <a href={whatsappLink('Hi Akshat Enterprises, I have a question.')}><MessageCircle size={16} /> WhatsApp us</a>
          </div>
          <div className="footer-links">
            <span>Customer Care &amp; Legal</span>
            <button type="button" className="footer-link-btn" onClick={() => handleOpen('terms')}>Terms &amp; Conditions</button>
            <button type="button" className="footer-link-btn" onClick={() => handleOpen('privacy')}>Privacy Policy</button>
            <button type="button" className="footer-link-btn" onClick={() => handleOpen('shipping')}>Shipping &amp; Returns</button>
            <button type="button" className="footer-link-btn" onClick={() => handleOpen('grievance')}>Grievance Officer</button>
          </div>
          <div className="footer-visit">
            <span>Visit Us</span>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Shop+No.+51,+Janta+Market,+Sector-23,+Turbhe,+Navi+Mumbai+-+400705"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={16} /> Get Directions
            </a>
            <p className="footer-address">
              Shop No. 51, Janta Market,<br />
              Sector-23, Turbhe,<br />
              Navi Mumbai – 400705
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Akshat Enterprises. All rights reserved. • GSTIN: 27AABFA2488R1ZM</p>
          <div className="footer-legal-links">
            <button type="button" onClick={() => handleOpen('terms')}>Terms</button>
            <span>•</span>
            <button type="button" onClick={() => handleOpen('privacy')}>Privacy</button>
            <span>•</span>
            <button type="button" onClick={() => handleOpen('shipping')}>Shipping</button>
            <span>•</span>
            <button type="button" onClick={() => handleOpen('grievance')}>Compliance</button>
          </div>
        </div>
      </footer>

      {/* Internal popup fallback if standalone */}
      <LegalModal
        isOpen={internalModalOpen}
        onClose={() => setInternalModalOpen(false)}
        initialTab={internalTab}
      />
    </>
  );
}
