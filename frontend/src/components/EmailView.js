import React from 'react';
import { Paper, Typography, Box, Divider, Chip } from '@mui/material';
import styles from '../styles/Home.module.css';

const EmailView = ({ email }) => {
  if (!email) return null;
  
  // Format the date if it exists
  const formattedDate = email.created_at 
    ? new Date(email.created_at).toLocaleString() 
    : 'Unknown date';

  return (
    <Paper className={styles.emailViewContainer} elevation={1}>
      <Box className={styles.emailHeader}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h5" gutterBottom>
            {email.subject || '(No subject)'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {formattedDate}
          </Typography>
        </Box>
        
        <Box className={styles.emailFieldContainer}>
          <Typography component="span" className={styles.emailFieldLabel}>
            To:
          </Typography>
          <Typography component="span" className={styles.emailField}>
            {email.to}
          </Typography>
        </Box>
        
        {email.cc && (
          <Box className={styles.emailFieldContainer}>
            <Typography component="span" className={styles.emailFieldLabel}>
              CC:
            </Typography>
            <Typography component="span" className={styles.emailField}>
              {email.cc}
            </Typography>
          </Box>
        )}
        
        {email.bcc && (
          <Box className={styles.emailFieldContainer}>
            <Typography component="span" className={styles.emailFieldLabel}>
              BCC:
            </Typography>
            <Typography component="span" className={styles.emailField}>
              {email.bcc}
            </Typography>
          </Box>
        )}
      </Box>
      
      <Divider />
      
      <Box className={styles.emailBody} mt={2}>
        <Typography>
          {email.body}
        </Typography>
      </Box>
    </Paper>
  );
};

export default EmailView;
