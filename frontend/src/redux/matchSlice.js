// redux/matchSlice.js
import { createSlice } from "@reduxjs/toolkit";

const matchSlice = createSlice({
  name: "match",
  initialState: {
    currentMatch: null,
    opponent: null,
  },
  reducers: {
    setMatch: (state, action) => {
      console.log("✅ matchSlice: setMatch called", action.payload);
      state.currentMatch = action.payload;
    },
    setOpponent: (state, action) => {
      state.opponent = action.payload;
    },
    clearMatch: (state) => {
      state.currentMatch = null;
      state.opponent = null;
    },
  },
});

export const { setMatch, setOpponent, clearMatch } = matchSlice.actions;
export default matchSlice.reducer;
