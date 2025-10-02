# ShareSpace - Premium Campus Marketplace

A sophisticated, fully-functional campus marketplace web application built with React and TypeScript. ShareSpace allows students to buy, sell, and trade products within their campus community with an elegant old money aesthetic design.

## ✨ Features

- **🔐 Complete Authentication System**
  - User registration with college details (name, email, phone, college, department, roll number)
  - Secure login/logout functionality
  - Single account for both buying and selling

- **🛍️ Product Management**
  - Browse products with advanced search and filters
  - Product detail pages with full information
  - Seller dashboard to add, edit, and delete listings
  - Product categories and condition ratings

- **💬 Real-time Chat System**
  - Direct messaging between buyers and sellers
  - Conversation history
  - Product-specific chat threads

- **📝 Feedback System**
  - Submit feedback on products, faculty, or platform
  - Admin-only visibility for privacy
  - Category-based feedback organization

- **👑 Admin Dashboard**
  - View all registered users
  - Manage all product listings
  - Block/unblock users and products
  - Review and manage all feedback submissions
  - Comprehensive statistics

- **🎨 Premium Design**
  - Old money aesthetic with dusky blush pink color palette
  - Smooth animations and hover effects
  - Fully responsive layout
  - Professional typography with Playfair Display and Inter fonts

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have the following installed on your computer:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation

Follow these simple steps to get the project running on your local machine:

1. **Download or Clone the Project**
   - If you have the project as a ZIP file, extract it to a folder
   - Or if using Git: `git clone <repository-url>`

2. **Open Terminal/Command Prompt**
   - On Windows: Press `Win + R`, type `cmd`, and press Enter
   - On Mac: Press `Cmd + Space`, type "Terminal", and press Enter
   - On Linux: Press `Ctrl + Alt + T`

3. **Navigate to the Project Folder**
   ```bash
   cd path/to/sharespace
   ```
   (Replace `path/to/sharespace` with the actual path where you saved the project)

4. **Install Dependencies**
   ```bash
   npm install
   ```
   This will download all the necessary packages. It may take a few minutes.

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

6. **Open Your Browser**
   - The terminal will show a URL (usually `http://localhost:8080`)
   - Open this URL in your web browser
   - The application should now be running!

## 📱 How to Use

### For Regular Users:

1. **Create an Account**
   - Click "Get Started" or "Register" on the homepage
   - Fill in all your details (name, email, phone, college info)
   - Create a password and click "Create Account"

2. **Browse Products**
   - After logging in, you'll see the Browse page
   - Use the search bar to find specific items
   - Filter by category or condition
   - Click on any product card to see full details

3. **Chat with Sellers**
   - On any product page, click the "Chat with Seller" button
   - Start a conversation about the product
   - All your chats are saved in the Messages section

4. **Sell Products**
   - Click "Sell" in the navigation bar
   - Click "Add Product" button
   - Fill in product details (title, description, price, category, condition)
   - Click "Add Product" to list it
   - Edit or delete your products anytime from the Seller Dashboard

5. **Submit Feedback**
   - Click "Feedback" in the navigation bar
   - Choose a category (Product, Faculty, Platform, or Other)
   - Write your subject and detailed feedback
   - Click "Submit Feedback"
   - Your feedback will be sent to admin (confidential)

### For Administrators:

1. **Admin Login**
   - Go to `/admin-login` page or click "Admin Login" link
   - Default credentials:
     - Username: `admin`
     - Password: `admin123`

2. **Admin Dashboard**
   - **Users Tab**: View all registered users, block/unblock accounts
   - **Products Tab**: See all listings, block products, or delete them
   - **Feedback Tab**: Read all user feedback, mark as reviewed/resolved

## 🗂️ Project Structure

```
sharespace/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Shadcn UI components (buttons, cards, etc.)
│   │   ├── Navigation.tsx # Main navigation bar
│   │   └── ProductCard.tsx # Product display card
│   │
│   ├── contexts/         # State management (like mini databases)
│   │   ├── AuthContext.tsx      # Handles user login/registration
│   │   ├── ProductContext.tsx   # Manages products
│   │   ├── ChatContext.tsx      # Handles messaging
│   │   └── FeedbackContext.tsx  # Manages feedback
│   │
│   ├── pages/            # All application pages
│   │   ├── Home.tsx             # Landing page
│   │   ├── Login.tsx            # User login page
│   │   ├── Register.tsx         # User registration
│   │   ├── Browse.tsx           # Product browsing
│   │   ├── ProductDetail.tsx    # Single product view
│   │   ├── SellerDashboard.tsx  # Seller management
│   │   ├── Chat.tsx             # Messaging interface
│   │   ├── Feedback.tsx         # Feedback form
│   │   ├── AdminLogin.tsx       # Admin authentication
│   │   └── AdminDashboard.tsx   # Admin panel
│   │
│   ├── App.tsx           # Main app component with routes
│   ├── index.css         # Global styles and design system
│   └── main.tsx          # App entry point
│
├── index.html            # HTML template
├── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Project dependencies
```

## 🎨 Design System

The application uses a sophisticated design system based on an "old money" aesthetic:

### Color Palette
- **Primary**: Dusky blush pink (#D4A5A5)
- **Secondary**: Deep burgundy (#8B4545)
- **Accent**: Gold (#D4AF37)
- **Background**: Warm cream (#F5F1E8)

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Animations
- Smooth fade-ins on page load
- Hover effects with scale and shadow
- Elegant transitions throughout

## 💾 Data Storage

**Important**: This application uses **localStorage** for data storage, which means:
- All data is stored in your browser
- Data persists even after closing the browser
- Each browser has its own separate data
- To reset all data, clear your browser's localStorage

### Stored Data:
- User accounts
- Products
- Chat messages and conversations
- Feedback submissions

## 🔧 Technologies Used

### Core Technologies
- **React 18** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Page navigation

### UI Libraries
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### State Management
- **React Context API** - Global state management
- **React Query** - Data fetching and caching

### Styling & Animations
- **class-variance-authority** - Component variants
- **tailwind-merge** - Merge Tailwind classes
- **Sonner** - Toast notifications

## 🔄 Adding a Real Database Later

The code is structured to make database integration easy:

1. **Current Setup**: Uses localStorage (browser storage)
2. **To Migrate**: Simply update the Context files to use API calls instead of localStorage
3. **Structure**: All data operations are centralized in Context files

Example migration:
```typescript
// Current (localStorage)
const users = JSON.parse(localStorage.getItem('users') || '[]');

// Future (with database API)
const users = await fetch('/api/users').then(res => res.json());
```

## 🐛 Troubleshooting

### Issue: "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: Port already in use
**Solution**: 
```bash
# Kill the process using the port
npm run dev -- --port 3000
```

### Issue: Page doesn't load after npm run dev
**Solution**: 
- Wait a few seconds for the build to complete
- Check the terminal for the correct URL
- Try clearing browser cache

### Issue: Changes don't appear
**Solution**:
- Save your files (Ctrl+S or Cmd+S)
- The page should auto-refresh
- If not, manually refresh the browser

## 📝 Customization Guide

### Changing Colors
Edit `src/index.css` - Look for the `:root` section with color variables:
```css
--primary: 0 25% 70%;  /* Change these HSL values */
```

### Adding New Pages
1. Create a new file in `src/pages/`
2. Add the route in `src/App.tsx`
3. Add navigation links in `Navigation.tsx`

### Modifying Product Fields
1. Update interface in `src/contexts/ProductContext.tsx`
2. Update form in `src/pages/SellerDashboard.tsx`
3. Update display in `src/components/ProductCard.tsx`

## 🤝 Support

If you encounter any issues or need help:
1. Check the Troubleshooting section above
2. Review the code comments (they explain every step!)
3. Make sure all dependencies are installed: `npm install`

## 📄 License

This project is created for educational purposes.

---

**Made with ❤️ for campus communities**

Enjoy using ShareSpace! 🎓🛍️
