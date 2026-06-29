import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDB } from "../database/db";
import { auth } from "../firebase/firebaseConfig";

export const loadMetrics = createAsyncThunk("metrics/load", async () => {
	const db = await getDB();
	const uid = auth.currentUser.uid;
	const data = await db.getAllAsync("SELECT * FROM metrics WHERE userId = ?", [
		uid,
	]);
	return data.reduce((acc, row) => {
		acc[row.platform] = row;
		return acc;
	}, {});
});

export const saveMetrics = createAsyncThunk(
	"metrics/save",
	async ({ platform, followers }) => {
		const db = await getDB();
		const uid = auth.currentUser.uid;
		await db.runAsync(
			`INSERT INTO metrics (userId, platform, followers, updatedAt)
		 VALUES (?, ?, ?, ?)
		 ON CONFLICT(userId, platform) DO UPDATE SET
		 followers=excluded.followers, updatedAt=excluded.updatedAt`,
			[uid, platform, followers, new Date().toISOString()],
		);
		return { platform, followers };
	},
);

const metricsSlice = createSlice({
	name: "metrics",
	initialState: { data: {}, loading: false, error: null },
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(loadMetrics.pending, (state) => {
				state.loading = true;
			})
			.addCase(loadMetrics.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload;
			})
			.addCase(loadMetrics.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message;
			})
			.addCase(saveMetrics.fulfilled, (state, action) => {
				const { platform, ...rest } = action.payload;
				state.data[platform] = { ...state.data[platform], ...rest };
			});
	},
});

export default metricsSlice.reducer;
