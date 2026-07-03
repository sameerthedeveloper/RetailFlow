import axios from 'axios';

export const login = async (route = '/auth/login', data = {}) => {
    try {
        const url = `${import.meta.env.VITE_BASE_URL || ''}${route}`;
        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (err) {
        // Normalize error
        if (err.response && err.response.data) throw err.response.data;
        throw err;
    }
};

export const signup = async (route = '/auth/signup', data = {}) => {
    try {
        const url = `${import.meta.env.VITE_BASE_URL || ''}${route}`;
        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (err) {
        // Normalize error
        if (err.response && err.response.data) throw err.response.data;
        throw err;
    }
};

export const getCurrentUser = async (route = '/auth/currentuser', data = {}) => {
    try {
        const url = `${import.meta.env.VITE_BASE_URL || ''}${route}`;
        const response = await axios.get(url, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (err) {
        // Normalize error
        if (err.response && err.response.data) throw err.response.data;
        throw err;
    }
};

export default { login, signup, getCurrentUser };