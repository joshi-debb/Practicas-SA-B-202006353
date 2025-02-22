import React, { useState } from "react";
import styled from 'styled-components';

import ImageIcon from '../assets/incognito.png';

import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

const SignIn = () => {
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                credentials: 'include', // Para enviar cookies de sesión
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: password})
            });

            const data = await response.json();

            if (response.ok) {
                swal("Éxito", "Inicio de sesión exitoso", "success");
                navigate('/home');
            } else {
                swal("Error", data.message, "error");
            }
        } catch (error) {
            swal("Error", "No se pudo conectar con el servidor", "error");
        }
    };

    const goToSignUp = () => {
        navigate('/signup');
    }


    return (
        <StyledWrapper>
            <form className="form" onSubmit={handleSubmit}>

                <h1 className="form-title">JWT APP</h1>
                <img src={ImageIcon} />
                <p>Inicio de Sesion</p>

                <div>
                    <input autoComplete="off" placeholder="Nombre de usuario" className="input" type="text" value={user} onChange={(e) => setUser(e.target.value)} />
                </div>
                <div>
                    <input placeholder="Contraseña" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <Button type="submit" label="Ingresar" color="#88C273" />

                <p className="signup-link">
                    No tienes una cuenta?
                    <a rel="noopener noreferrer" onClick={goToSignUp} className="signup-link link"> Regístrate</a>
                </p>

            </form>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
    font-family: 'Segoe UI';
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;

    .form {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 2em;
        border-radius: 25px;
        transition: .4s ease-in-out;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
        width: 250px;
    }

    .form:hover {
        transform: scale(1.05);
        border: 1px solid #2A333580;
    }

    .form-title {
        font-size: 2.5em;
        margin-bottom: 1em;
        color: #333;
    }

    input, select {
        width: 100%;
        outline: none;
        border: 1px solid #dadada;
        padding: 8px;
        border-radius: 5px;
        transition: .3s;
        color: black;
    }

    input:focus {
        border: 1px solid #2A333580;
        transform: scale(1.02);
    }

    img {
        width: 200px;
    }

    .signup-link {
        align-self: center;
        font-weight: 500;
    }

    .signup-link .link {
        font-weight: 400;
    }

    a {
        color:rgb(55, 117, 209);
        cursor: pointer;
        text-decoration: underline;

    }
`;

export default SignIn;