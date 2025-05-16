// redux/slices/opponentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  opponent: null,
};

const opponentSlice = createSlice({
  name: "opponent",
  initialState,
  reducers: {
    setOpponent: (state, action) => {
      state.opponent = action.payload;
    },
    clearOpponent: (state) => {
      state.opponent = null;
    },
  },
});

export const { setOpponent, clearOpponent } = opponentSlice.actions;
export default opponentSlice.reducer;
