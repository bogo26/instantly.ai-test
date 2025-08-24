import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Tooltip,
  Modal,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { routeAiPrompt, generateEmailWithAi } from "../api";

const ComposeEmailDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
    });
  };

  const openAiModal = () => {
    setIsAiModalOpen(true);
    setError(null);
  };

  const closeAiModal = () => {
    setIsAiModalOpen(false);
    setAiPrompt("");
    setError(null);
  };

  const handleAiPromptChange = (e) => {
    setAiPrompt(e.target.value);
  };

  const generateEmail = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log("Sending prompt to router:", aiPrompt);

      // First, route the prompt to determine which assistant to use
      try {
        const { assistantType } = await routeAiPrompt(aiPrompt);
        console.log(`Router selected assistant type: ${assistantType}`);

        // Then, use the selected assistant to generate the email
        try {
          const { subject, body } = await generateEmailWithAi(
            aiPrompt,
            assistantType
          );
          console.log("Generated email content:", { subject, body });

          // Update the form data with the generated content
          setFormData((prev) => ({
            ...prev,
            subject,
            body,
          }));

          closeAiModal();
        } catch (genError) {
          console.error("Error in email generation step:", genError);
          setError(`Email generation failed: ${genError.message}`);
        }
      } catch (routeError) {
        console.error("Error in AI routing step:", routeError);
        setError(`AI routing failed: ${routeError.message}`);
      }
    } catch (error) {
      console.error("Error in overall generation process:", error);
      setError(error.message || "Failed to generate email. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Compose Email</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="To"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="CC"
              name="cc"
              value={formData.cc}
              onChange={handleInputChange}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="BCC"
              name="bcc"
              value={formData.bcc}
              onChange={handleInputChange}
              variant="outlined"
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                variant="outlined"
              />
              <Tooltip title="Generate with AI">
                <IconButton
                  color="primary"
                  onClick={openAiModal}
                  sx={{
                    borderRadius: "8px",
                    border: "1px solid #1976d2",
                    padding: "8px",
                  }}
                >
                  <AutoAwesomeIcon /> AI
                </IconButton>
              </Tooltip>
            </Box>

            <TextField
              fullWidth
              label="Body"
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              multiline
              rows={10}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={!formData.to || !formData.subject}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Prompt Modal */}
      <Modal
        open={isAiModalOpen}
        onClose={!isGenerating ? closeAiModal : undefined}
        aria-labelledby="ai-prompt-modal"
        aria-describedby="modal-to-get-ai-prompt"
      >
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            p: 4,
            outline: "none",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            What should this email be about?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={3}
            label="Describe your email"
            placeholder="E.g., Meeting request for Tuesday, Follow-up on our previous discussion, etc."
            value={aiPrompt}
            onChange={handleAiPromptChange}
            disabled={isGenerating}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}
          >
            <Button onClick={closeAiModal} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              onClick={generateEmail}
              variant="contained"
              color="primary"
              disabled={isGenerating || !aiPrompt.trim()}
              startIcon={
                isGenerating ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default ComposeEmailDialog;
