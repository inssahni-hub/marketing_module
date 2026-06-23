import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosReq from "./../request/axiosReq";

/* ================= CACHE ================= */
const cachedUser = localStorage.getItem("auth_user");

/* ================= INITIAL STATE ================= */
const initialState = {
  isAuthenticated: !!cachedUser,
  user: cachedUser ? JSON.parse(cachedUser) : null,
  appStatus: cachedUser ? "ready" : "idle",
  authStatus: "idle",
  authError: null,
};

/* ================= AUTH ME ================= */
export const fetchAuthMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosReq.get("/api/auth/me", {
        withCredentials: true,
        headers: { "Cache-Control": "no-store" },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ================= LOGOUT ================= */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosReq.post(
        "/api/auth/logout",
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ================= SWITCH ROLE ================= */
export const switchRole = createAsyncThunk(
  "auth/switch-role",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosReq.post(
        "/api/auth/switch-role",
        payload,
        { withCredentials: true }
      );

      // 🔥 notify all modules
      localStorage.setItem("auth_changed", Date.now());

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ================= SWITCH ORG ================= */
export const switchOrganization = createAsyncThunk(
  "auth/switch-organization",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosReq.post(
        "/api/auth/switch-organization",
        payload,
        { withCredentials: true }
      );

      localStorage.setItem("auth_changed", Date.now());

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ================= SLICE ================= */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuth: () => initialState,
    clearAuthError: (state) => {
      state.authError = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== AUTH ME ===== */
      .addCase(fetchAuthMe.pending, (state) => {
        state.appStatus = "loading";
      })
      .addCase(fetchAuthMe.fulfilled, (state, action) => {
        state.appStatus = "ready";

        if (action.payload?.success && action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;

          localStorage.setItem(
            "auth_user",
            JSON.stringify(action.payload.user)
          );
        } else {
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("auth_user");
        }
      })
      .addCase(fetchAuthMe.rejected, (state) => {
        state.appStatus = "ready";
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("auth_user");
      })

      /* ===== LOGOUT ===== */
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.appStatus = "idle";
        state.authStatus = "idle";
        localStorage.removeItem("auth_user");
      })
      .addCase(logoutUser.rejected, (state) => {
        // 🔥 still force logout
        state.isAuthenticated = false;
        state.user = null;
        state.appStatus = "idle";
        localStorage.removeItem("auth_user");
      })

      /* ===== SWITCH ROLE ===== */
      .addCase(switchRole.fulfilled, (state, action) => {
        if (action.payload?.user) {
          state.user = action.payload.user;
          localStorage.setItem(
            "auth_user",
            JSON.stringify(action.payload.user)
          );
        }
      })

      /* ===== SWITCH ORG ===== */
      .addCase(switchOrganization.fulfilled, (state, action) => {
        if (action.payload?.user) {
          state.user = action.payload.user;
          localStorage.setItem(
            "auth_user",
            JSON.stringify(action.payload.user)
          );
        }
      });
  },
});

export const { resetAuth, clearAuthError } = authSlice.actions;
export default authSlice.reducer;