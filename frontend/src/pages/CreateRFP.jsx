import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Stepper, Step, StepLabel, Button, Paper } from '@mui/material';
import RFPChatCreator from '../components/RFPChatCreator';
import VendorSelector from '../components/VendorSelector';
import { rfpAPI } from '../services/api';

const steps = ['Create RFP', 'Select Vendors', 'Send'];

function CreateRFP() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [createdRFP, setCreatedRFP] = useState(null);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [sending, setSending] = useState(false);

  const handleRFPCreated = (rfp) => {
    setCreatedRFP(rfp);
    setActiveStep(1);
  };

  const handleSendRFP = async () => {
    try {
      setSending(true);
      const result = await rfpAPI.send(createdRFP.id, selectedVendors);
      if (result.success) {
        setSending(false);
        setActiveStep(2);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending RFP:', error);
      setSending(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New RFP
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <RFPChatCreator onRFPCreated={handleRFPCreated} />
      )}

      {activeStep === 1 && (
        <VendorSelector
          selectedVendors={selectedVendors}
          onSelectionChange={setSelectedVendors}
          onSendRFP={handleSendRFP}
          sending={sending}
        />
      )}

      {activeStep === 2 && (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="success.main" gutterBottom>
            ✓ RFP Sent Successfully!
          </Typography>
          <Typography variant="body1" paragraph>
            Your RFP has been sent to {selectedVendors.length} vendor(s).
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to dashboard...
          </Typography>
        </Paper>
      )}

      {activeStep > 0 && activeStep < 2 && (
        <Box sx={{ mt: 2 }}>
          <Button onClick={() => setActiveStep(activeStep - 1)}>
            Back
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default CreateRFP;
