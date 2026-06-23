import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth-slice";

import sessionReducer from "./sessionSlice";



import commonFeatureSlice from "./common-slice";

const store = configureStore({
  reducer: {

    /* ================= AUTH ================= */

    auth: authReducer,

    session: sessionReducer,

    
    /* ================= COMMON ================= */

    commonFeature: commonFeatureSlice,
  },
});

export default store;