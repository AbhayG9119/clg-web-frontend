import React from 'react';

const TutorialButton = ({ videoUrl }) => {
  const handleClick = () => {
    window.open(videoUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '8px 16px',
        backgroundColor: '#ff0000',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        margin: '10px 0'
      }}
    >
      Watch Tutorial Video
    </button>
  );
};

export default TutorialButton;
