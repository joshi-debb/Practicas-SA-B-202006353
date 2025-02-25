import React, { useState, useEffect } from "react";
import styled from 'styled-components';

import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:8080/protected/home', {
                    method: 'GET',
                    credentials: 'include',
                });

                const data = await response.json();

                console.log('data', data);

                if (response.ok) {
                    setMessage(data.message);
                } else {
                    swal("Error", data.message, "error");
                    navigate('/');
                }
            } catch (error) {
                navigate('/');
            }
        };

        checkAuth();
    }, [navigate]);

    const handleLogout  = async () => {
        try {
            const response = await fetch('http://localhost:8080/users/logout', {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                swal("Éxito", data.message, "info");
                navigate('/');
            }

        } catch (error) {
            navigate('/');
        }
    };

    return (
        <StyledWrapper>
            <div className="home">
                <h1>Home</h1>
                <form>
                    <h1>{message || "Cargando..."}</h1>
                    <Button type="button" label="Salir" color="#982B1C" onClick={handleLogout} />
                </form>
            </div>
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

    .home {
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

    .home:hover {
        transform: scale(1.05);
        border: 1px solid #2A333580;
    }

    .home-title {
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

export default Home;