import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

function RFPChatCreator({ onRFPCreated }) {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedRFP, setGeneratedRFP] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setError('Please enter a description for your RFP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/rfps/create-from-nl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput })
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedRFP(result.data);
        if (onRFPCreated) {
          onRFPCreated(result.data);
        }
      } else {
        setError(result.error || 'Failed to create RFP');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setGeneratedRFP(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (generatedRFP && !editMode) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" color="primary">
            Generated RFP
          </Typography>
          <Button
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
            variant="outlined"
          >
            Edit
          </Button>
        </Box>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{generatedRFP.title}</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {generatedRFP.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Requirements:</Typography>
            {generatedRFP.requirements && generatedRFP.requirements.map((req, index) => (
              <Box key={index} sx={{ ml: 2, mb: 1 }}>
                <Typography variant="body2">
                  <strong>{req.item}</strong> - {req.specification} (Qty: {req.quantity})
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Chip label={`Budget: ${generatedRFP.budget}`} color="primary" />
              <Chip label={`Deadline: ${generatedRFP.deadline}`} color="secondary" />
              <Chip label={`Status: ${generatedRFP.status}`} />
            </Box>

            {generatedRFP.evaluationCriteria && generatedRFP.evaluationCriteria.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>Evaluation Criteria:</Typography>
                <Box sx={{ ml: 2 }}>
                  {generatedRFP.evaluationCriteria.map((criteria, index) => (
                    <Typography key={index} variant="body2">• {criteria}</Typography>
                  ))}
                </Box>
              </>
            )}

            {generatedRFP.specialRequirements && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Special Requirements:</Typography>
                <Typography variant="body2">{generatedRFP.specialRequirements}</Typography>
              </>
            )}
          </CardContent>
        </Card>

        <Alert severity="success">
          RFP created successfully! You can now send it to vendors from the dashboard.
        </Alert>
      </Paper>
    );
  }

  if (editMode) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Edit RFP
        </Typography>

        <TextField
          fullWidth
          label="Title"
          value={generatedRFP?.title || ''}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={generatedRFP?.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Budget"
          value={generatedRFP?.budget || ''}
          onChange={(e) => handleFieldChange('budget', e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          type="date"
          label="Deadline"
          value={generatedRFP?.deadline || ''}
          onChange={(e) => handleFieldChange('deadline', e.target.value)}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setEditMode(false)}
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            onClick={() => setEditMode(false)}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        Create RFP with AI
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Describe your procurement needs in natural language, and our AI will generate a structured RFP for you.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        multiline
        rows={6}
        placeholder="Example: I need 50 laptops with 16GB RAM, Intel i7 processor, Windows 11, for a budget of $40,000 total. Delivery needed by March 31, 2026. Priority is on warranty and support."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        size="large"
        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        onClick={handleSubmit}
        disabled={loading || !userInput.trim()}
        fullWidth
      >
        {loading ? 'Generating RFP...' : 'Generate RFP'}
      </Button>
    </Paper>
  );
}

export default RFPChatCreator;
