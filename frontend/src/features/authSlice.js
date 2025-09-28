import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status : false,
    userData: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload.userData;
            localStorage.setItem("auth", JSON.stringify(state));
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
            localStorage.removeItem("auth");
        }
     }
})

export const {login, logout} = authSlice.actions;

export default authSlice.reducer;