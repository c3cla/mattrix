import React from 'react';
import EnhancedLoginScreen from './Form';

function Login() {
    return <EnhancedLoginScreen route="/api/token/" method="login" />;
}

export default Login;
