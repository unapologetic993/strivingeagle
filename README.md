# Striving Eagle E-commerce Website

A modern, fully responsive e-commerce website for selling clothes and accessories, built with HTML, CSS, and JavaScript.

## Features

### 🏠 Homepage
- Clean, professional design with hero section
- Latest products showcase
- Male and Female category navigation
- Contact information prominently displayed

### 👕 Categories
- **Male Products**: Glasses, Earrings, Socks, Hats, Beanies, Jeans, Sweatpants, Jorts
- **Female Products**: Glasses, Earrings, Socks, Hats, Beanies, Jeans, Sweatpants, Jorts
- Age group filters (Kids, Teens, Adults)
- Size filters (Small, Medium, Large, XL, etc.)
- Advanced filtering by category, age, and size

### 🛍️ Product Pages
- Individual product pages with detailed information
- Product images with thumbnail gallery
- Price display in Malawian Kwacha (MWK)
- Size and quantity selection
- "Add to Cart" and "Buy Now" functionality
- Related products suggestions

### 🛒 Shopping Cart
- Add/remove products
- Update quantities
- Real-time price calculation in MWK
- Checkout form with customer information
- Delivery options for Lilongwe and across Malawi

### 🎨 Themes & Customization
- Dynamic theme switching based on:
  - Gender (Male/Female themes)
  - Dark/Light mode toggle
- Responsive color schemes
- Smooth animations and transitions

### 📱 Latest Posts
- New arrivals section with "New Arrival" badges
- Filter by gender and category
- Highlight newest products

### 📞 Contact Section
- Phone number display for orders
- WhatsApp integration
- Contact form for order placement
- Delivery information

### 🔍 Additional Features
- Search functionality
- Mobile-responsive navigation
- Sticky header with cart counter
- Local storage for cart persistence
- Smooth animations and micro-interactions

## Technical Implementation

### Structure
```
striving-eagle/
├── index.html          # Homepage
├── male.html           # Male products page
├── female.html         # Female products page
├── latest.html         # Latest arrivals page
├── product.html        # Individual product page
├── contact.html        # Contact page
├── css/
│   └── styles.css      # Complete styling with themes
├── js/
│   └── script.js       # All JavaScript functionality
├── data/
│   └── products.json   # Product data
└── README.md           # Documentation
```

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS variables, Grid, and Flexbox
- **JavaScript ES6+**: Modern JavaScript for interactivity
- **Font Awesome**: Icons for UI elements
- **Unsplash**: High-quality product images

### Key Features Implementation

#### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Flexible grid layouts
- Touch-friendly interface elements

#### Theme System
- CSS custom properties for easy theming
- Gender-specific color schemes
- Dark/light mode toggle
- Persistent theme preference

#### Shopping Cart
- Local storage for cart persistence
- Real-time cart updates
- Quantity management
- Price calculations in MWK

#### Product Management
- JSON-based product data
- Easy product addition and updates
- Dynamic product filtering
- Search functionality

## Getting Started

1. **Download or clone** the project files
2. **Open `index.html`** in your web browser
3. **Navigate** through the website using the navigation menu

### No Build Process Required
This is a static website that runs directly in the browser. No server setup or build process is needed.

## Customization

### Adding New Products
1. Open `data/products.json`
2. Add new product objects following the existing format:
```json
{
  "id": "unique-id",
  "name": "Product Name",
  "category": "category-name",
  "gender": "male|female",
  "ageGroup": "kids|teens|adults",
  "price": 15000,
  "description": "Product description",
  "image": "image-url",
  "sizes": ["s", "m", "l"],
  "isNew": true,
  "inStock": true
}
```

### Modifying Styles
- Edit `css/styles.css` for visual changes
- Use CSS custom properties for theme colors
- Responsive breakpoints are clearly marked

### Adding New Pages
1. Create new HTML file following existing templates
2. Add navigation link to all pages
3. Implement page-specific JavaScript in `js/script.js`

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Features Used**: CSS Grid, Flexbox, ES6+ JavaScript

## Performance Optimization

- Optimized images with proper sizing
- Efficient CSS with minimal redundancy
- Lazy loading for product images
- Local storage for cart data
- Minimal external dependencies

## Contact Information

- **Phone**: 0999921219 | 0883 31 07 09
- **WhatsApp**: [0999921219](https://wa.me/26599921219) | [0883 31 07 09](https://wa.me/265883310709)
- **Delivery**: Across Malawi

## Future Enhancements

- Payment gateway integration
- User account system
- Product reviews and ratings
- Advanced search with filters
- Email notifications
- Admin panel for product management

---

**Striving Eagle** - Fly Higher in Style — Trendy Fashion & Accessories in Malawi 🇲🇼
