import axios from 'axios'

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

export function createApi(token) {
  return axios.create({
    baseURL: BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
}