import { configureStore } from "@reduxjs/toolkit";
import metricsReducer from "./metricsSlice";
import authReducer from "./authSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		metrics: metricsReducer,
	},
});
