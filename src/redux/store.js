// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import diagramReducer from './diagramSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    // This is where you combine all your reducers (slices)
    diagram: diagramReducer,
    chat: chatReducer,
    // Add other reducers here if your app grows, e.g.,
    // auth: authReducer,
    // user: userReducer,
  },
  // DevTools are enabled by default in development mode
  // You can customize middleware here if needed, but configureStore handles
  // defaults like redux-thunk automatically.
});
