import React from 'react';
import { Modal, Box, Typography, Alert } from '@mui/material';
import { styled } from '@mui/system';


const LoadingModal = ({ open }) => {
  return (
    <Modal
      open={open}
      aria-labelledby="loading-modal-title"
      aria-describedby="loading-modal-description"
      BackdropProps={{
        style: {
          backgroundColor: 'transparent',
        },
      }}
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: 2,
        pointerEvents: 'none', // Prevents interactions with the modal backdrop
        '&:hover': {
          outline: 'none', // Removes any default hover effects
        },
      }}
    >
      <Box
        sx={{
          pointerEvents: 'all', // Allows interaction with the Alert component
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          width: '100%',
          height: '100%',
          outline: 'none', // Ensures no outline is shown on the box
        }}
      >
        <Alert
          severity="info"
          sx={{
            width: '300px',
            border: 'none', // Ensures no border is applied
            boxShadow: 'none', // Removes any box shadow if applied
            '&:hover': {
              border: 'none', // Ensures no border on hover
            },
          }}
        >
          Loading...
        </Alert>
      </Box>
    </Modal>
  );
};

export default LoadingModal;
