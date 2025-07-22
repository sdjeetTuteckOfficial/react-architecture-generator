// src/redux/diagramSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Define the initial state for this slice
const initialState = {
  diagramType: 'architecture', // 'architecture' or 'db_diagram'
  userPrompt: '',
  // You can add more state here related to diagrams, e.g.,
  // generatedJson: null,
  // isLoading: false,
  // error: null,
};

// Create a slice using createSlice
export const diagramSlice = createSlice({
  name: 'diagram', // A name for your slice, used in action types (e.g., 'diagram/setDiagramType')
  initialState, // The initial state defined above
  reducers: {
    // Reducers are functions that define how the state changes
    // Each function here will automatically generate an action creator
    setDiagramType: (state, action) => {
      // Immer (built into Redux Toolkit) allows you to write "mutating" logic
      // directly. It converts it into immutable updates behind the scenes.
      state.diagramType = action.payload; // action.payload will be the new diagram type
    },
    setUserPrompt: (state, action) => {
      state.userPrompt = action.payload; // action.payload will be the new user prompt
    },
    // Example of another reducer:
    // setGeneratedJson: (state, action) => {
    //   state.generatedJson = action.payload;
    // },
    // setLoading: (state, action) => {
    //   state.isLoading = action.payload;
    // },
    // setError: (state, action) => {
    //   state.error = action.payload;
    // },
  },
});

// Export the auto-generated action creators
export const {
  setDiagramType,
  setUserPrompt /*, setGeneratedJson, setLoading, setError */,
} = diagramSlice.actions;

// Export the reducer function for the store
export default diagramSlice.reducer;
