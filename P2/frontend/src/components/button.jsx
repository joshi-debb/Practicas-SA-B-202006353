import React from 'react';
import styled from 'styled-components';

const Button = ({type, label, color, onClick}) => {
  return (
    <StyledWrapper color={color}>
      <button type={type} onClick={onClick} > {label}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`

  margin-top: 20px;
  
  button {
    
   padding: 15px 25px;
   border: unset;
   border-radius: 15px;
   color: #212121;
   z-index: 1;
   background: #e8e8e8;
   position: relative;
   font-weight: 1000;
   font-size: 17px;
   -webkit-box-shadow: 4px 8px 19px -3px rgba(0,0,0,0.27);
   box-shadow: 4px 8px 19px -3px rgba(0,0,0,0.27);
   transition: all 250ms;
   overflow: hidden;
  }

  button::before {
   content: "";
   position: absolute;
   top: 0;
   left: 0;
   height: 100%;
   width: 0;
   border-radius: 15px;
   background-color: ${({ color }) => color || '#212121'};
   z-index: -1;
   -webkit-box-shadow: 4px 8px 19px -3px rgba(0,0,0,0.27);
   box-shadow: 4px 8px 19px -3px rgba(0,0,0,0.27);
   transition: all 250ms
  }

  button:hover {
   color: #e8e8e8;
   transform: scale(1.1);
  }

  button:hover::before {
   width: 100%;
  }
`;

export default Button;