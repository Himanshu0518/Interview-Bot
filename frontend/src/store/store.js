import {configureStore} from '@reduxjs/toolkit';
import authSlice from '../features/authSlice';
import resumeSlice from '../features/resumeSlice'; 
import {login} from '../features/authSlice';

const store = configureStore({
    reducer: {
        auth : authSlice,
        resume : resumeSlice

        //TODO: add more slices here for posts
    }
});

const persistedAuth = localStorage.getItem("auth");
if (persistedAuth) {
  store.dispatch(login(JSON.parse(persistedAuth)));
}
export default store;