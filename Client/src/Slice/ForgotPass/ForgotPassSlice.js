import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'


export const forgotPass = createAsyncThunk('auth/forgot', async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post('http://api.eventoo.online/user/forgot-password', formData)
    console.log(response)
    return response.data
  } catch (error) {
    if (error.response) {
        console.log(error.response.data)
      return rejectWithValue(error.response.data)
    }
    throw error
  }
})

export const forgot = createSlice({
  name: 'forgot',
  initialState: {
    loading: false,
    error: null,
    user: null,
  },
  reducers: {},
  extraReducers: {
    [forgotPass.pending]: (state) => {
      state.loading = true
      state.error = null
    },
    [forgotPass.fulfilled]: (state, action) => {
      state.loading = false
      state.error = null
      state.user = action.payload
      state.loginIn=action.payload.msg
    },
    [forgotPass.rejected]: (state, action) => {
      state.loading = false
      state.error = action.payload
      state.user = null
    },
  },
})


export default forgot.reducer