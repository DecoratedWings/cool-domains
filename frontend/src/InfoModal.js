import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function InfoModal(props) {
   const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="button-container">
            <button className='cta-button info-button' onClick={handleOpen}>
              info 🔥
            </button> 
      <div/>            
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" >
            Lit Domain Types:
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <b>Regular</b>🔥 Lit domains are minted and will be owned forever on Polygon.
          </Typography>
          <br/>
          <Typography>
          <b>Launch Domains</b>🔥 are intended for rent and are a cheaper option for users 
            with a temporary use case. <i>Examples include NFT launch countdown websites,
            sites for users with exclusive temporary mint lists, etc.</i>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
  }
  