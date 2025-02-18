import React, { useState } from "react";
import styled from 'styled-components';

import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import Button from '../components/Button';

import ImageIcon from '../assets/profile.png';


const SignUp = () => {
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const goToSignIn = () => {
        navigate('/');
    }

    return (
        <StyledWrapper>
            <form className="form" onSubmit={handleSubmit}>
                <h1 className="form-title">REGISTRO</h1>

                <img src={ImageIcon}/>

                <p>Formulario de registro</p>

                <div>
                    <input autoComplete="off" placeholder="Nombre de usuario" type="text" value={user} onChange={(e) => setUser(e.target.value)} />
                </div>
                <div>
                    <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                
                <Button type="submit" label="Registro" color="#E07B39"/>
    
                <p className="signup-link">
                    Ya tienes una cuenta?
                    <a rel="noopener noreferrer" onClick={goToSignIn} className="signup-link link"> Inicia Sesion</a>
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

export default SignUp;