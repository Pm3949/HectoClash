import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        authUser: null,
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.authUser = action.payload;
        },
        removeAuthUser: (state) => {
            state.authUser = null;
        },
        updateAuthUser: (state, action) => {
            state.authUser = { ...state.authUser, ...action.payload };
        },
    },

})

export const { setAuthUser,removeAuthUser,updateAuthUser } = userSlice.actions;
export default userSlice.reducer;