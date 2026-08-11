import React from 'react';

const AppSpinner = (props) => {
  return (
    <div
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: '100%',
        width: '100%',
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: props.notransparent ? 'white' : 'rgba(0,0,0,0.2)',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: '4px solid #e2e8f0',
          borderTopColor: '#C8A45D',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AppSpinner;
