// redux/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedAgent: "BRD", // Default agent
  messages: [
    {
      id: 1,
      text: "Hi, what can I help with? V-3",
      isBot: true,
      subtitle: "Let me know how I can assist you today",
      timestamp: new Date().toISOString(),
      agent: "BRD",
    },
  ],
  isLoading: false,
  currentThread: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedAgent: (state, action) => {
      state.selectedAgent = action.payload;
      console.log(`Redux: Agent changed to ${action.payload}`);
    },

    addMessage: (state, action) => {
      console.log("Redux: Adding message", action.payload);
      const newMessage = {
        id: Date.now() + Math.random(), // Ensure unique ID
        text: action.payload.text,
        isBot: action.payload.isBot,
        subtitle: action.payload.subtitle || null,
        timestamp: new Date().toISOString(),
        agent: state.selectedAgent, // Track which agent this message is for
      };
      state.messages.push(newMessage);
    },

    clearMessages: (state) => {
      state.messages = [];
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setCurrentThread: (state, action) => {
      state.currentThread = action.payload;
    },
  },
});

export const {
  setSelectedAgent,
  addMessage,
  clearMessages,
  setLoading,
  setCurrentThread,
} = chatSlice.actions;

export default chatSlice.reducer;

// Selectors for easy access
export const selectSelectedAgent = (state) => state.chat.selectedAgent;
export const selectMessages = (state) => state.chat.messages;
export const selectIsLoading = (state) => state.chat.isLoading;
export const selectCurrentThread = (state) => state.chat.currentThread;
