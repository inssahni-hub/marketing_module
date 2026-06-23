import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSessionExpired: false,
  reAuthLoading: false,
  reAuthError: null,
};

const sessionSlice = createSlice({
  name: "session",

  initialState,

  reducers: {
    openSessionModal: (state) => {
      state.isSessionExpired = true;
    },

    closeSessionModal: (state) => {
      state.isSessionExpired = false;
      state.reAuthError = null;
    },

    setReAuthLoading: (state, action) => {
      state.reAuthLoading = action.payload;
    },

    setReAuthError: (state, action) => {
      state.reAuthError = action.payload;
    },
  },
});

export const {
  openSessionModal,
  closeSessionModal,
  setReAuthLoading,
  setReAuthError,
} = sessionSlice.actions;

export default sessionSlice.reducer;