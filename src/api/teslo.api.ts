import axios from 'axios';
import { useAuthStore } from '../stores';

const tesloApi = axios.create({
    baseURL: 'http://localhost:3000/api',
});

tesloApi.interceptors.request.use((config) => {
    //como estoy fuera del contexto de React, cojo el getstate como si fuera un metodo normal de clase de JS
    const token = useAuthStore.getState().token
    // console.log({token})
    if(token){
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config;
});

export { tesloApi };
