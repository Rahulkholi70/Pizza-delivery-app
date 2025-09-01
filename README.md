# Pizza Ordering Frontend

A modern React application for building and ordering custom pizzas with real-time order tracking and admin management.

## Features

### User Features
- **Authentication System**
  - User registration with email verification
  - Secure login/logout
  - Forgot password functionality
  - Profile management

- **Pizza Customization**
  - Choose from 5 pizza base options
  - Select from 5 sauce varieties
  - Pick cheese types
  - Add multiple vegetable toppings
  - Include meat options
  - Real-time price calculation

- **Order Management**
  - Place custom pizza orders
  - Razorpay payment integration
  - Order history and tracking
  - Real-time status updates

### Admin Features
- **Dashboard**
  - Order overview and statistics
  - User management
  - Inventory tracking

- **Inventory Management**
  - Add/edit/delete pizza ingredients
  - Stock level monitoring
  - Low stock notifications
  - Bulk stock updates

- **Order Management**
  - View all orders
  - Update order statuses
  - Order tracking

## Tech Stack

- **Frontend Framework**: React 18
- **State Management**: React Context API with useReducer
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS with utility classes
- **Payment**: Razorpay integration
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (LoadingSpinner, etc.)
│   ├── layout/         # Layout components (Navbar, Footer)
│   ├── auth/           # Authentication components
│   ├── pizza/          # Pizza-related components
│   └── admin/          # Admin-specific components
├── contexts/            # React Context providers
│   ├── AuthContext.js  # Authentication state
│   ├── CartContext.js  # Pizza customization state
│   └── OrderContext.js # Order management state
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   ├── user/           # User dashboard pages
│   └── admin/          # Admin dashboard pages
├── utils/               # Utility functions
├── App.js              # Main app component
└── index.js            # App entry point
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Ensure the backend server is running on `http://localhost:5000`
   - Update API base URL in `src/index.js` if needed

4. **Start the development server**
   ```bash
   npm start
   ```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Component Overview

### Context Providers

#### AuthContext
Manages user authentication state including:
- Login/logout functionality
- User registration
- Password reset
- Profile updates
- JWT token management

#### CartContext
Handles pizza customization state:
- Selected pizza base, sauce, cheese
- Vegetable and meat toppings
- Price calculations
- Cart completion status

#### OrderContext
Manages order operations:
- Order creation and management
- Payment processing
- Order history
- Status updates

### Key Components

#### PizzaBuilder
The main pizza customization interface where users can:
- Select pizza base
- Choose sauce
- Pick cheese
- Add/remove toppings
- See real-time pricing
- Proceed to checkout

#### OrderTracking
Real-time order status tracking with:
- Current order status
- Estimated delivery time
- Order history
- Status update notifications

#### AdminDashboard
Comprehensive admin interface featuring:
- Order overview
- Inventory management
- User management
- Analytics and reports

## API Integration

The frontend communicates with the backend through RESTful API endpoints:

- **Authentication**: `/api/auth/*`
- **Pizza Options**: `/api/pizza/*`
- **Orders**: `/api/order/*`
- **Admin**: `/api/admin/*`
- **Inventory**: `/api/inventory/*`
- **User Management**: `/api/user/*`

## Payment Integration

### Razorpay Setup
1. Create a Razorpay account
2. Get test API keys
3. Configure in backend environment
4. Test payment flow

### Payment Flow
1. User builds pizza and proceeds to checkout
2. Order is created in backend
3. Razorpay order is generated
4. User completes payment
5. Payment is verified
6. Order is confirmed

## State Management

The app uses React Context API with useReducer for state management:

- **Centralized State**: All app state is managed through contexts
- **Predictable Updates**: Actions and reducers ensure consistent state changes
- **Performance**: Context optimization prevents unnecessary re-renders
- **Scalability**: Easy to add new features and state

## Styling Approach

- **Utility-First CSS**: Custom utility classes for rapid development
- **Responsive Design**: Mobile-first approach with breakpoints
- **Component-Based**: Styles are scoped to components
- **Modern UI**: Clean, professional design with smooth animations

## Responsive Design

The app is fully responsive with:
- Mobile-first approach
- Flexible grid system
- Adaptive navigation
- Touch-friendly interactions
- Optimized for all screen sizes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Features

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Responsive image handling
- **Efficient State**: Minimal re-renders
- **Bundle Optimization**: Tree shaking and minification

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Client-side form validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based CSRF prevention
- **Secure Headers**: Proper security headers

## Testing

- **Unit Tests**: Component testing with Jest
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end user flow testing
- **Performance Tests**: Load and stress testing

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Netlify**: Drag and drop build folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Upload build files
- **Heroku**: Deploy with buildpacks

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key
REACT_APP_APP_NAME=Pizza Ordering App
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure backend server is running
   - Check API base URL configuration
   - Verify CORS settings

2. **Payment Issues**
   - Check Razorpay configuration
   - Verify test mode settings
   - Check browser console for errors

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check for syntax errors
   - Verify all dependencies are installed

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## License

This project is licensed under the MIT License.

## Acknowledgments

- React team for the amazing framework
- Razorpay for payment integration
- Create React App for the build setup
- All contributors and supporters
