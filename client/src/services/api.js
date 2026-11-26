
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

export const getData = async (url) => {
    const response = await api.get(url);
    return response.data;
};

export const postData = async (url, data) => {
    const response = await api.post(url, data);
    return response.data;
};

export const updateData = async (url, data) => {
    const response = await api.put(url, data);
    return response.data;
};

export const deleteData = async (url) => {
    const response = await api.delete(url);
    return response.data;
};

export default api;
