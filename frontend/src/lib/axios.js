import axios from "axios"
const api = axios.create({
baseURL: "http://localhost:4444/api",
timeout: 10000,
withCredentials: true,
headers: {
"Content-Type": "application/json"
}
})

export default api