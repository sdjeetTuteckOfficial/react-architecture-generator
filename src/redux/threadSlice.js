// redux/threadSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentThread: {
    threadId: null,
    threadName: null,
    currentVersion: 0,
  },
  conversationHistory: {}, // { threadId: [conversations] }
  selectedConversation: null,
  isLoadingThread: false,
  error: null,
};

const threadSlice = createSlice({
  name: 'thread',
  initialState,
  reducers: {
    setCurrentThread: (state, action) => {
      state.currentThread = {
        threadId: action.payload.threadId,
        threadName: action.payload.threadName,
        currentVersion: action.payload.currentVersion,
      };
    },
    setConversationHistory: (state, action) => {
      const { threadId, conversations } = action.payload;
      state.conversationHistory[threadId] = conversations;
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    clearCurrentThread: (state) => {
      state.currentThread = {
        threadId: null,
        threadName: null,
        currentVersion: 0,
      };
      state.selectedConversation = null;
    },
    setLoadingThread: (state, action) => {
      state.isLoadingThread = action.payload;
    },
    setThreadError: (state, action) => {
      state.error = action.payload;
    },
    incrementVersion: (state) => {
      if (state.currentThread.threadId) {
        state.currentThread.currentVersion += 1;
      }
    },
  },
});

export const {
  setCurrentThread,
  setConversationHistory,
  setSelectedConversation,
  clearCurrentThread,
  setLoadingThread,
  setThreadError,
  incrementVersion,
} = threadSlice.actions;

// Selectors
export const selectCurrentThread = (state) => state.thread.currentThread;
export const selectConversationHistory = (state) =>
  state.thread.conversationHistory;
export const selectSelectedConversation = (state) =>
  state.thread.selectedConversation;
export const selectThreadLoading = (state) => state.thread.isLoadingThread;
export const selectThreadError = (state) => state.thread.error;

export default threadSlice.reducer;
