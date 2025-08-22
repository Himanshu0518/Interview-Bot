import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
}

export const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setResume: (state, action) => {
      state.data = action.payload
      state.status = 'succeeded'
      state.error = null
      console.log("Resume set in Redux:", action.payload); // Debug log
    },
    clearResume: (state) => {
      state.data = null
      state.status = 'idle'
      state.error = null
    },
    setResumeLoading: (state) => {
      state.status = 'loading'
      state.error = null
    },
    setResumeError: (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    }
  },
})

export const { setResume, clearResume, setResumeLoading, setResumeError } = resumeSlice.actions

export default resumeSlice.reducer