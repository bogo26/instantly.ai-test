import { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Paper, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ComposeEmailDialog from '../components/ComposeEmailDialog';
import EmailView from '../components/EmailView';
import styles from '../styles/Home.module.css';
import { fetchEmails, createEmail } from '../api';

export default function Home() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [openComposeDialog, setOpenComposeDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch emails from the API
  useEffect(() => {
    const getEmails = async () => {
      try {
        setLoading(true);
        const data = await fetchEmails();
        setEmails(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching emails:', error);
        setError('Failed to load emails. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    getEmails();
  }, []);

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
  };

  const handleOpenComposeDialog = () => {
    setOpenComposeDialog(true);
  };

  const handleCloseComposeDialog = () => {
    setOpenComposeDialog(false);
  };

  const handleSaveEmail = async (emailData) => {
    try {
      const newEmail = await createEmail(emailData);
      setEmails([newEmail, ...emails]);
      setOpenComposeDialog(false);
    } catch (error) {
      console.error('Error saving email:', error);
    }
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.layout}>
        {/* Sidebar */}
        <Paper className={styles.sidebar} elevation={2}>
          <Typography variant="h6" className={styles.sidebarHeader}>
            Inbox
          </Typography>
          <List>
            {loading ? (
              <ListItem>
                <ListItemText primary="Loading emails..." />
              </ListItem>
            ) : error ? (
              <ListItem>
                <ListItemText primary={error} secondary="Please try again later" />
              </ListItem>
            ) : emails.length > 0 ? (
              emails.map((email) => (
                <ListItem
                  button
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  selected={selectedEmail && selectedEmail.id === email.id}
                >
                  <ListItemText
                    primary={email.subject || '(No subject)'}
                    secondary={`To: ${email.to}`}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No emails yet" />
              </ListItem>
            )}
          </List>
        </Paper>

        {/* Email Content */}
        <Box className={styles.content}>
          {selectedEmail ? (
            <EmailView email={selectedEmail} />
          ) : (
            <Box className={styles.noSelection}>
              <Typography variant="h6">Select an email or create a new one</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Compose Button (Bottom Right) */}
      <Fab
        color="primary"
        className={styles.composeButton}
        onClick={handleOpenComposeDialog}
        aria-label="compose"
      >
        <AddIcon />
      </Fab>

      {/* Compose Email Dialog */}
      <ComposeEmailDialog
        open={openComposeDialog}
        onClose={handleCloseComposeDialog}
        onSave={handleSaveEmail}
      />
    </Box>
  );
}
