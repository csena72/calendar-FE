import { useDispatch, useSelector } from 'react-redux';
import { calendarApi } from '../api';
import { onChecking, onLogin, onLogout, clearErrorMessage } from '../store';

export const useAuthStore = () => {

    const { status, user, errorMessage } = useSelector( state => state.auth );
    const dispatch = useDispatch();


    const startRegister = async({name, email, password}) => {
        dispatch( onChecking() );
        try {
            const { data } = await calendarApi.post('/auth/new', { name, email, password });

            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());
            dispatch( onLogin( { name: data.name, uid: data.uid } ) );

        } catch (error) {
            dispatch( onLogout(error.response.data?.msg || 'Error') );
            setTimeout(() => {
                dispatch( clearErrorMessage() );
            }, 10);
        }

    }

    const startLogin = async({email, password}) => {
        dispatch( onChecking() );
        try {
            const { data } = await calendarApi.post('/auth', { email, password});
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());
            dispatch( onLogin( { name: data.name, uid: data.uid } ) );
            
        } catch (error) {
            dispatch( onLogout('Credenciales incorrectas') );
            setTimeout(() => {
                dispatch( clearErrorMessage() );
            }, 10);
        }
    }

    const checkAuthToken = async() => {
        const token = localStorage.getItem('token') || '';

        if (token.length === 0) {
            dispatch( onLogout('No hay token') );
            return;
        }

        try {
            const { data } = await calendarApi.get('/auth/renew');
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());
            dispatch( onLogin( { name: data.name, uid: data.uid } ) );
        } catch (error) {
            localStorage.clear();
            dispatch( onLogout() );
        }
    }

    const startLogout = () => {
        localStorage.clear();
        dispatch( onLogout() );
    }
 
    return {
        // Propiedades
        status,
        user,
        errorMessage,

        // Métodos
        checkAuthToken,
        startLogout,
        startLogin,
        startRegister,
    }
}