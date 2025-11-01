import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status : false,
    userData: null,
    token: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload.userData;
            state.token = action.payload.token || localStorage.getItem('token');
            localStorage.setItem("auth", JSON.stringify(state));
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
            state.token = null;
            localStorage.removeItem("auth");
            localStorage.removeItem("token");
        }
     }
})

export const {login, logout} = authSlice.actions;

export default authSlice.reducer;