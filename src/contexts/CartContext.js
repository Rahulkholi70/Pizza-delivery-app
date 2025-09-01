import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create context
const CartContext = createContext();

// Initial state
const initialState = {
  selectedBase: null,
  selectedSauce: null,
  selectedCheese: null,
  selectedVeggies: [],
  selectedMeats: [],
  totalPrice: 0,
  isComplete: false
};

// Action types
const CART_ACTIONS = {
  SET_BASE: 'SET_BASE',
  SET_SAUCE: 'SET_SAUCE',
  SET_CHEESE: 'SET_CHEESE',
  ADD_VEGGIE: 'ADD_VEGGIE',
  REMOVE_VEGGIE: 'REMOVE_VEGGIE',
  ADD_MEAT: 'ADD_MEAT',
  REMOVE_MEAT: 'REMOVE_MEAT',
  CLEAR_CART: 'CLEAR_CART',
  CALCULATE_TOTAL: 'CALCULATE_TOTAL',
  CHECK_COMPLETION: 'CHECK_COMPLETION'
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_BASE:
      return {
        ...state,
        selectedBase: action.payload,
        isComplete: false
      };
    case CART_ACTIONS.SET_SAUCE:
      return {
        ...state,
        selectedSauce: action.payload,
        isComplete: false
      };
    case CART_ACTIONS.SET_CHEESE:
      return {
        ...state,
        selectedCheese: action.payload,
        isComplete: false
      };
    case CART_ACTIONS.ADD_VEGGIE:
      return {
        ...state,
        selectedVeggies: [...state.selectedVeggies, action.payload],
        isComplete: false
      };
    case CART_ACTIONS.REMOVE_VEGGIE:
      return {
        ...state,
        selectedVeggies: state.selectedVeggies.filter(
          veggie => veggie._id !== action.payload
        ),
        isComplete: false
      };
    case CART_ACTIONS.ADD_MEAT:
      return {
        ...state,
        selectedMeats: [...state.selectedMeats, action.payload],
        isComplete: false
      };
    case CART_ACTIONS.REMOVE_MEAT:
      return {
        ...state,
        selectedMeats: state.selectedMeats.filter(
          meat => meat._id !== action.payload
        ),
        isComplete: false
      };
    case CART_ACTIONS.CLEAR_CART:
      return initialState;
    case CART_ACTIONS.CALCULATE_TOTAL:
      const basePrice = state.selectedBase ? state.selectedBase.price : 0;
      const saucePrice = state.selectedSauce ? state.selectedSauce.price : 0;
      const cheesePrice = state.selectedCheese ? state.selectedCheese.price : 0;
      const veggiesPrice = state.selectedVeggies.reduce((sum, veggie) => sum + veggie.price, 0);
      const meatsPrice = state.selectedMeats.reduce((sum, meat) => sum + meat.price, 0);
      
      return {
        ...state,
        totalPrice: basePrice + saucePrice + cheesePrice + veggiesPrice + meatsPrice
      };
    case CART_ACTIONS.CHECK_COMPLETION:
      const hasBase = !!state.selectedBase;
      const hasSauce = !!state.selectedSauce;
      const hasCheese = !!state.selectedCheese;
      
      return {
        ...state,
        isComplete: hasBase && hasSauce && hasCheese
      };
    default:
      return state;
  }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Calculate total whenever cart items change
  useEffect(() => {
    dispatch({ type: CART_ACTIONS.CALCULATE_TOTAL });
    dispatch({ type: CART_ACTIONS.CHECK_COMPLETION });
  }, [
    state.selectedBase,
    state.selectedSauce,
    state.selectedCheese,
    state.selectedVeggies,
    state.selectedMeats
  ]);

  // Set base
  const setBase = (base) => {
    dispatch({ type: CART_ACTIONS.SET_BASE, payload: base });
  };

  // Set sauce
  const setSauce = (sauce) => {
    dispatch({ type: CART_ACTIONS.SET_SAUCE, payload: sauce });
  };

  // Set cheese
  const setCheese = (cheese) => {
    dispatch({ type: CART_ACTIONS.SET_CHEESE, payload: cheese });
  };

  // Add veggie
  const addVeggie = (veggie) => {
    // Check if veggie is already selected
    const isAlreadySelected = state.selectedVeggies.some(
      selected => selected._id === veggie._id
    );
    
    if (!isAlreadySelected) {
      dispatch({ type: CART_ACTIONS.ADD_VEGGIE, payload: veggie });
    }
  };

  // Remove veggie
  const removeVeggie = (veggieId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_VEGGIE, payload: veggieId });
  };

  // Add meat
  const addMeat = (meat) => {
    // Check if meat is already selected
    const isAlreadySelected = state.selectedMeats.some(
      selected => selected._id === meat._id
    );
    
    if (!isAlreadySelected) {
      dispatch({ type: CART_ACTIONS.ADD_MEAT, payload: meat });
    }
  };

  // Remove meat
  const removeMeat = (meatId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_MEAT, payload: meatId });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Get cart summary
  const getCartSummary = () => {
    return {
      base: state.selectedBase,
      sauce: state.selectedSauce,
      cheese: state.selectedCheese,
      veggies: state.selectedVeggies,
      meats: state.selectedMeats,
      totalPrice: state.totalPrice,
      isComplete: state.isComplete
    };
  };

  // Get order items for API
  const getOrderItems = () => {
    const items = [];
    
    if (state.selectedBase) {
      items.push({
        name: state.selectedBase.name,
        quantity: 1,
        image: state.selectedBase.image.url,
        price: state.selectedBase.price,
        category: 'base',
        itemId: state.selectedBase._id
      });
    }
    
    if (state.selectedSauce) {
      items.push({
        name: state.selectedSauce.name,
        quantity: 1,
        image: state.selectedSauce.image.url,
        price: state.selectedSauce.price,
        category: 'sauce',
        itemId: state.selectedSauce._id
      });
    }
    
    if (state.selectedCheese) {
      items.push({
        name: state.selectedCheese.name,
        quantity: 1,
        image: state.selectedCheese.image.url,
        price: state.selectedCheese.price,
        category: 'cheese',
        itemId: state.selectedCheese._id
      });
    }
    
    state.selectedVeggies.forEach(veggie => {
      items.push({
        name: veggie.name,
        quantity: 1,
        image: veggie.image.url,
        price: veggie.price,
        category: 'veggie',
        itemId: veggie._id
      });
    });
    
    state.selectedMeats.forEach(meat => {
      items.push({
        name: meat.name,
        quantity: 1,
        image: meat.image.url,
        price: meat.price,
        category: 'meat',
        itemId: meat._id
      });
    });
    
    return items;
  };

  // Check if item is selected
  const isItemSelected = (itemId, category) => {
    switch (category) {
      case 'base':
        return state.selectedBase?._id === itemId;
      case 'sauce':
        return state.selectedSauce?._id === itemId;
      case 'cheese':
        return state.selectedCheese?._id === itemId;
      case 'veggie':
        return state.selectedVeggies.some(veggie => veggie._id === itemId);
      case 'meat':
        return state.selectedMeats.some(meat => meat._id === itemId);
      default:
        return false;
    }
  };

  // Context value
  const value = {
    // State
    selectedBase: state.selectedBase,
    selectedSauce: state.selectedSauce,
    selectedCheese: state.selectedCheese,
    selectedVeggies: state.selectedVeggies,
    selectedMeats: state.selectedMeats,
    totalPrice: state.totalPrice,
    isComplete: state.isComplete,
    
    // Actions
    setBase,
    setSauce,
    setCheese,
    addVeggie,
    removeVeggie,
    addMeat,
    removeMeat,
    clearCart,
    getCartSummary,
    getOrderItems,
    isItemSelected
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
