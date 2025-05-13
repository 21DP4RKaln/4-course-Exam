import React from 'react';
import styled from 'styled-components';

const SocialMediaButtons = () => {
  return (
    <StyledWrapper>
      <div className="main">
        <div className="up">
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="card1">
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="35px" height="35px" fillRule="nonzero" className="instagram"><g fillRule="nonzero" stroke="none" strokeWidth={1} strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit={10} strokeDashoffset={0} fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: 'normal'}}><g transform="scale(8,8)"><path d="M11.46875,5c-3.55078,0 -6.46875,2.91406 -6.46875,6.46875v9.0625c0,3.55078 2.91406,6.46875 6.46875,6.46875h9.0625c3.55078,0 6.46875,-2.91406 6.46875,-6.46875v-9.0625c0,-3.55078 -2.91406,-6.46875 -6.46875,-6.46875zM11.46875,7h9.0625c2.47266,0 4.46875,1.99609 4.46875,4.46875v9.0625c0,2.47266 -1.99609,4.46875 -4.46875,4.46875h-9.0625c-2.47266,0 -4.46875,-1.99609 -4.46875,-4.46875v-9.0625c0,-2.47266 1.99609,-4.46875 4.46875,-4.46875zM21.90625,9.1875c-0.50391,0 -0.90625,0.40234 -0.90625,0.90625c0,0.50391 0.40234,0.90625 0.90625,0.90625c0.50391,0 0.90625,-0.40234 0.90625,-0.90625c0,-0.50391 -0.40234,-0.90625 -0.90625,-0.90625zM16,10c-3.30078,0 -6,2.69922 -6,6c0,3.30078 2.69922,6 6,6c3.30078,0 6,-2.69922 6,-6c0,-3.30078 -2.69922,-6 -6,-6zM16,12c2.22266,0 4,1.77734 4,4c0,2.22266 -1.77734,4 -4,4c-2.22266,0 -4,-1.77734 -4,-4c0,-2.22266 1.77734,-4 4,-4z" /></g></g></svg>
          </a>
          <a href="https://www.twitch.tv/" target="_blank" rel="noopener noreferrer" className="card2">
            <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24" className="twitch"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
          </a>
        </div>
        <div className="down">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="card3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="35px" height="35px" className="github"><path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z" /></svg>
          </a>
          <a href="https://www.youtube.com/@sitvain" target="_blank" rel="noopener noreferrer" className="card4">
            <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24" className="youtube"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .main {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }

  .up, .down {
    display: flex;
    flex-direction: row;
    gap: 0.5em;
  }

  .card1, .card2, .card3, .card4 {
    width: 90px;
    height: 90px;
    outline: none;
    border: none;
    background: white;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    transition: .2s ease-in-out;
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
  }

  .card1 {
    border-radius: 90px 5px 5px 5px;
  }

  .card2 {
    border-radius: 5px 90px 5px 5px;
  }
    
  .card3 {
    border-radius: 5px 5px 5px 90px;
  }

  .card4 {
    border-radius: 5px 5px 90px 5px;
  }

  .instagram {
    fill: #cc39a4;
  }

  .twitch {
    fill: #9146FF;
  }

  .github {
    fill: #333;
  }

  .youtube {
    fill: #FF0000;
  }

  .card1:hover {
    cursor: pointer;
    scale: 1.1;
    background-color: #cc39a4;
  }

  .card1:hover .instagram {
    fill: white;
  }

  .card2:hover {
    cursor: pointer;
    scale: 1.1;
    background-color: #9146FF;
  }

  .card2:hover .twitch {
    fill: white;
  }

  .card3:hover {
    cursor: pointer;
    scale: 1.1;
    background-color: black;
  }

  .card3:hover .github {
    fill: white;
  }

  .card4:hover {
    cursor: pointer;
    scale: 1.1;
    background-color: #FF0000;
  }

  .card4:hover .youtube {
    fill: white;
  }`;

export default SocialMediaButtons;
