import { MapPin, Phone, MessageCircle, Instagram } from 'lucide-react';
import { whatsappLink, secondPhone } from '../constants';
import { Link } from 'react-router-dom';

export function Footer() {
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
              <img src="/AE-logo.png" alt="Akshat Enterprises" className="site-footer-logo-img" />
            </Link>
            <p>Wholesalers of safety shoes, jackets,<br />caps, gum boots &amp; workwear.</p>
          </div>
          <div className="footer-contact">
            <span>Have a question?</span>
            <a href={`tel:9892228186`}><Phone size={16} /> 98922 28186</a>
            <a href={whatsappLink('Hi Akshat Enterprises, I have a question.')}><MessageCircle size={16} /> WhatsApp us</a>
          </div>
          <div className="footer-links">
            <span>Explore</span>
            <Link to="/">Shop</Link>
            <Link to="/products">All Products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/admin">Admin</Link>
          </div>
          <div className="footer-visit">
            <span>Visit Us</span>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer"><MapPin size={16} /> Get Directions</a>
            <p className="footer-address">
              Shop No 2, Janta Market,<br />
              Turbhe, Navi Mumbai<br />
              Maharashtra 400705
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Akshat Enterprises. All rights reserved.</p>
          <div className="footer-social">
            <a href="#instagram" aria-label="Instagram"><Instagram size={18} /></a>
          </div>
        </div>
      </footer>
    </>
  );
}
