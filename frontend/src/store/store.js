import {configureStore} from '@reduxjs/toolkit';
import authSlice from '../features/authSlice';
import resumeSlice from '../features/resumeSlice'; 

const store = configureStore({
    reducer: {
        auth : authSlice,
        resume : resumeSlice

        //TODO: add more slices here for posts
    }
});


export default store;