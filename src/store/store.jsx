import { configureStore } from "@reduxjs/toolkit";
import metricsReducer from "./metricsSlice";

export const store = configureStore({
	reducer: {
		metrics: metricsReducer,
	},
});
