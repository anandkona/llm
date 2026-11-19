import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, MenuItem
} from '@mui/material';
import { Add, Refresh, Edit, Block } from '@mui/icons-material';

export default function UniversityManager() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', domain: '', status: 'active' });
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/universities', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setUniversities(data.universities);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load universities.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setFormError('University name and code are required.');
      return;
    }
    try {
      const res = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to create university');
        return;
      }
      setOpenModal(false);
      setFeedback({ type: 'success', message: 'University created successfully!' });
      fetchUniversities();
    } catch (err) {
      setFormError('Network error');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/universities/${id}/deactivate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: `University status set to ${nextStatus}` });
        fetchUniversities();
      }
    } catch (e) {
      setFeedback({ type: 'error', message: 'Error changing university status' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight="bold" color="primary">University Tenant Management</Typography>
          <Typography variant="body2" color="text.secondary">Create and govern multi-tenant universities across the system</Typography>
        </div>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setFormError(''); setOpenModal(true); }}>
          Add University
        </Button>
      </Box>

      {feedback.message && (
        <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback({ type: '', message: '' })}>
          {feedback.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>University Name</strong></TableCell>
              <TableCell><strong>Domain</strong></TableCell>
              <TableCell><strong>Total Users</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : universities.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No universities found.</TableCell></TableRow>
            ) : (
              universities.map((uni) => (
                <TableRow key={uni.id} hover>
                  <TableCell><Chip label={uni.code} size="small" variant="outlined" color="primary" /></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{uni.name}</TableCell>
                  <TableCell>{uni.domain || 'N/A'}</TableCell>
                  <TableCell>{uni.total_users || 0} Accounts</TableCell>
                  <TableCell>
                    <Chip label={uni.status} size="small" color={uni.status === 'active' ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      color={uni.status === 'active' ? 'warning' : 'success'}
                      onClick={() => handleToggleStatus(uni.id, uni.status)}
                    >
                      {uni.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New University</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="University Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="University Code"
              required
              fullWidth
              placeholder="e.g. AUT"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <TextField
              label="Domain"
              fullWidth
              placeholder="e.g. agnes.edu"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
