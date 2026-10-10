import { useState } from 'react';
import {
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product, CartItem } from '../types';
import { DEPARTMENTS, DEPT_CATEGORIES, whatsappLink, secondPhone, faqs } from '../constants';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  products: Product[];
  productsLoading: boolean;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  activeDept: string;
  setActiveDept: (dept: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function HomePage({
  products,
  productsLoading,
  cart,
  setCart,
  activeDept,
  setActiveDept,
  activeCategory,
  setActiveCategory,
}: HomePageProps) {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleAddToCart = (product: Product, size: string) => {
    const inCart = cart.find((i) => i.name === product.name);
    if (!inCart) {
      setCart((prev) => [...prev, {
        name: product.name,
        category: product.category,
        price: product.priceValue, // Wait, App.tsx had product.price, I'll use priceValue
        image: product.image,
        tag: product.tag,
        quantity: 1,
        size: size,
      }]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        updated.splice(index, 1);
      } else {
        item.quantity = newQuantity;
      }
      return updated;
    });
  };

  return (
    <>
      <section className="hero section-pad">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> Turbhe's workwear destination</p>
          <h1>Built for the <em>worksite</em> &amp; street.</h1>
          <p className="hero-lead">Safety shoes, construction jackets, caps, mud boots and more — curated for people who work hard. Quality you can trust, prices that make sense.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#shop">Explore collection <ArrowUpRight size={18} /></a>
            <a className="text-link" href={whatsappLink('Hi Akshat Enterprises, I want help choosing workwear.')}>Ask us on WhatsApp <ChevronRight size={17} /></a>
          </div>
          <div className="hero-proof">
            <div><strong>10+</strong><span>years of trust</span></div>
            <div><strong>1k+</strong><span>items in-store</span></div>
            <div><strong>4.8</strong><span className="stars">★★★★★</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-label"><span>Featured gear</span><strong>Work hard. Stay protected.</strong></div>
          <div className="hero-shoe"><img src="/images/jacket.png" alt="Construction jacket — durable workwear" /></div>
          <div className="hero-stamp"><span>AE</span><small>Since<br />2014</small></div>
          <div className="visual-note"><span>01</span><span>New arrivals</span></div>
        </div>
      </section>

      <div className="marquee">
        <span>TURBHE'S FINEST</span>
        <span>WALK WITH CONFIDENCE</span>
        <span>QUALITY GUARANTEED</span>
        <span>BUILT TO LAST</span>
        <span>SAFETY FIRST</span>
      </div>

      <section id="shop" className="section-pad shop-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> The edit</p>
            <h2>Find your <em>perfect gear.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            <p className="heading-note">From worksite to street — safety shoes, jackets, caps and everything in between.</p>
            <Link
              className="text-link"
              to="/products"
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
            >
              View all products <ChevronRight size={17} />
            </Link>
          </div>
        </div>

        {/* Department tabs */}
        <div className="dept-tabs" role="tablist" aria-label="Product departments">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              className={activeDept === dept.id ? 'active' : ''}
              onClick={() => {
                setActiveDept(dept.id);
                setActiveCategory(dept.id === 'all' ? 'All Products' : (DEPT_CATEGORIES[dept.id]?.[0] ?? 'All Products'));
              }}
            >
              <span className="dept-emoji">{dept.emoji}</span>
              {dept.label}
            </button>
          ))}
        </div>

        {/* Sub-category chips */}
        {activeDept !== 'all' && DEPT_CATEGORIES[activeDept] && (
          <div className="category-tabs" role="tablist" aria-label="Product categories">
            <button
              className={activeCategory === 'All Products' ? 'active' : ''}
              onClick={() => setActiveCategory('All Products')}
            >
              All {DEPARTMENTS.find((d) => d.id === activeDept)?.label}
            </button>
            {DEPT_CATEGORIES[activeDept].map((category) => (
              <button
                className={activeCategory === category ? 'active' : ''}
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* All products tab */}
        {activeDept === 'all' && (
          <div className="category-tabs" role="tablist" aria-label="All product categories">
            {['All Products', ...Object.values(DEPT_CATEGORIES).flat()].map((category) => (
              <button
                className={activeCategory === category ? 'active' : ''}
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {productsLoading ? (
          <div className="products-loading">
            <div className="loading-spinner" />
            <span>Loading products…</span>
          </div>
        ) : (
          <div className="product-grid">
            {(activeDept === 'all'
              ? (activeCategory === 'All Products' ? products : products.filter((p) => p.category === activeCategory))
              : products.filter((p) => p.department === activeDept && (activeCategory === 'All Products' || p.category === activeCategory))
            ).slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cart={cart}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>
        )}

        {!productsLoading && products.length > 6 && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link className="button button-dark" to="/products">
              View all {products.length} products <ArrowUpRight size={18} />
            </Link>
          </div>
        )}

        <p className="stock-note"><span className="dot" /> Sizes available in-store — select any item to add to cart or enquire directly.</p>
      </section>

      <section className="trust-strip">
        <div><ShieldCheck size={22} /><span><strong>Quality checked</strong><small>Every pair, every time</small></span></div>
        <div><Truck size={22} /><span><strong>Local delivery</strong><small>Ask us for your pin code</small></span></div>
        <div><Sparkles size={22} /><span><strong>Value assured</strong><small>Wholesale-friendly pricing</small></span></div>
      </section>

      <section id="about" className="section-pad about-section">
        <div className="about-image">
          <img src="/images/jacket.png" alt="Construction jacket — Akshat Enterprises workwear" />
          <span className="about-caption">Full workwear.<br />One trusted store.</span>
        </div>
        <div className="about-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> The Akshat story</p>
          <h2>Complete gear. <em>Real value.</em></h2>
          <p>Akshat Enterprises is your one-stop workwear destination. We stock safety shoes, construction jackets, caps, mud boots and protective accessories — everything a working professional needs, without the showroom mark-up.</p>
          <p>Based in the heart of Janta Market, we believe getting your workwear should be simple: see it, try it, trust it. Our team helps you find the right fit, whether you need one piece or a full kit.</p>
          <a className="text-link" href={whatsappLink('Hi Akshat Enterprises, I would like to know more about your workwear collection.')}>
            Talk to our team <ChevronRight size={17} />
          </a>
        </div>
      </section>

      <section id="reviews" className="reviews-section section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> On the ground</p>
            <h2>Worn with <em>confidence.</em></h2>
          </div>
          <div className="review-score">
            <strong>4.8</strong>
            <span className="stars">★★★★★</span>
            <small>from our local community</small>
          </div>
        </div>
        <div className="review-grid">
          <blockquote>
            <div className="stars">★★★★★</div>
            <p>"Finally found safety shoes that are comfortable enough for a full shift. The team helped me pick the right size in minutes."</p>
            <footer><span className="avatar">RM</span><span><strong>Rakesh M.</strong><small>Turbhe, Navi Mumbai</small></span></footer>
          </blockquote>
          <blockquote>
            <div className="stars">★★★★★</div>
            <p>"Great collection at honest prices. I went in for one pair and ended up taking two. Very helpful people."</p>
            <footer><span className="avatar alt">PS</span><span><strong>Priya S.</strong><small>Sanpada, Navi Mumbai</small></span></footer>
          </blockquote>
          <blockquote>
            <div className="stars">★★★★★</div>
            <p>"The gum boots are sturdy and exactly what I needed for work. Will definitely come back for my next pair."</p>
            <footer><span className="avatar warm">AK</span><span><strong>Ajay K.</strong><small>Vashi, Navi Mumbai</small></span></footer>
          </blockquote>
        </div>
      </section>

      <section className="direct-section">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" /> No middleman</p>
          <h2>Not on Instagram.<br /><em>Still easy to reach.</em></h2>
        </div>
        <div className="direct-copy">
          <p>We keep it personal. Send us a WhatsApp message or give us a call — we will share photos, sizes, prices and honest advice directly.</p>
          <div className="direct-actions">
            <a className="button button-light" href={whatsappLink('Hi Akshat Enterprises, please share today\'s available footwear.')}>
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
            <a className="button button-outline" href={`tel:${secondPhone}`}>
              <Phone size={17} /> {secondPhone}
            </a>
          </div>
        </div>
      </section>

      <section className="faq-section section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> Good to know</p>
            <h2>Questions, <em>answered.</em></h2>
          </div>
          <p className="heading-note">Still unsure? Our team is only a message away.</p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => (
            <div className={openFaq === index ? 'faq-item open' : 'faq-item'} key={question}>
              <button onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                <span>{question}</span>
                {openFaq === index ? <X size={18} /> : <ChevronDown size={18} />}
              </button>
              {openFaq === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </section>

      <section id="location" className="location-section section-pad">
        <a
          className="map-card"
          href="https://www.google.com/maps/search/?api=1&query=Shop+No.+51+Janta+Market+Sector-23+Turbhe+Navi+Mumbai+400705"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open store location in Google Maps"
          title="Get directions to Akshat Enterprises"
          style={{ display: 'block', cursor: 'pointer', textDecoration: 'none' }}
        >
          <div className="map-grid" />
          <div className="map-pin"><MapPin size={25} /></div>
          <div className="map-label"><span>Find us here</span><strong>Janta Market</strong></div>
        </a>
        <div className="location-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> Come say hello</p>
          <h2>Right in the heart<br />of <em>Turbhe.</em></h2>
          <p>Shop No. 51, Janta Market,<br />Sector-23, Turbhe,<br />Navi Mumbai – 400705</p>
          <div className="hours">
            <Clock3 size={18} />
            <span><strong>Shop hours</strong><small>Mon – Sun · 10:00 AM – 9:00 PM</small></span>
          </div>
          <a
            className="button button-dark"
            href="https://www.google.com/maps/search/?api=1&query=Shop+No+51+Janta+Market+Sector+23+Turbhe+Navi+Mumbai+400705"
            target="_blank"
            rel="noreferrer"
          >
            Get directions <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
