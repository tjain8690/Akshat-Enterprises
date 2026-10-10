import { Moon, Menu, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { CartItem } from '../types';
import { whatsappLink } from '../constants';

interface HeaderProps {
  dark: boolean;
  setDark: (dark: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  cart: CartItem[];
}

export function Header({ dark, setDark, menuOpen, setMenuOpen, cart }: HeaderProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      <div className="announcement">
        <a href={whatsappLink('Hi Akshat Enterprises, I have a bulk order enquiry.')}>Bulk order enquiry →</a>
        <span>Turbhe • Mon-Sat</span>
      </div>

      <header className="site-header">
        <Link to="/" className="brand" aria-label="Akshat Enterprises Home">
          <img src="/AE-logo.png" alt="Akshat Enterprises" className="site-header-logo-img" />
        </Link>

        <nav className={`main-nav${menuOpen ? ' open' : ''}`}>
          <Link
            to="/"
            className={currentPath === '/' ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            to="/products"
            className={currentPath === '/products' ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Collection
          </Link>
          <Link
            to="/admin"
            className={currentPath === '/admin' ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            Manage
          </Link>
        </nav>

        <div className="header-actions">
          <Link
            to="/cart"
            className={`cart-header-btn${currentPath === '/cart' ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
            aria-label="View cart"
          >
            <ShoppingCart size={14} />
            <span className="cart-header-text">Cart</span>
            {cart.length > 0 && <span className="cart-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
          </Link>
          <button
            className="theme-toggle"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            <Moon size={18} fill={dark ? 'currentColor' : 'none'} />
          </button>
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>
    </>
  );
}
