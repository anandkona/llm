import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, MenuItem, Grid
} from '@mui/material';
import { Add, Refresh, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

export default function AcademicYearManager() {
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  // Modals
  const [openYearModal, setOpenYearModal] = useState(false);
  const [openSemModal, setOpenSemModal] = useState(false);

  const [yearForm, setYearForm] = useState({ year_name: '', start_date: '', end_date: '', is_current: false });
  const [semForm, setSemForm] = useState({ academic_year_id: '', name: '', term: 'Fall', start_date: '', end_date: '' });
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [formError, setFormError] = useState('');

  const fetchYears = async () => {
    setLoadingYears(true);
    try {
      const res = await fetch('/api/academic/academic-years', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setYears(data.data);
        if (data.data.length > 0 && !selectedYearId) {
          setSelectedYearId(data.data[0].id);
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load academic years.' });
    } finally {
      setLoadingYears(false);
    }
  };

  const fetchSemesters = async (yearId) => {
    if (!yearId) return;
    setLoadingSemesters(true);
    try {
      const res = await fetch(`/api/academic/semesters?academic_year_id=${yearId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSemesters(data.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load semesters.' });
    } finally {
      setLoadingSemesters(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYearId) {
      fetchSemesters(selectedYearId);
    }
  }, [selectedYearId]);

  const handleCreateYear = async (e) => {
    e.preventDefault();
    if (!yearForm.year_name || !yearForm.start_date || !yearForm.end_date) {
      setFormError('All academic year fields are required.');
      return;
    }
    try {
      const res = await fetch('/api/academic/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(yearForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to create academic year');
        return;
      }
      setOpenYearModal(false);
      setFeedback({ type: 'success', message: 'Academic Year registered successfully!' });
      fetchYears();
    } catch (err) {
      setFormError('Network error');
    }
  };

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    if (!semForm.name) {
      setFormError('Semester name is required.');
      return;
    }
    try {
      const res = await fetch('/api/academic/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...semForm, academic_year_id: selectedYearId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to create semester');
        return;
      }
      setOpenSemModal(false);
      setFeedback({ type: 'success', message: 'Semester registered successfully!' });
      fetchSemesters(selectedYearId);
    } catch (err) {
      setFormError('Network error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight="bold" color="primary">Academic Year & Semester Configuration</Typography>
          <Typography variant="body2" color="text.secondary">Configure academic calendar, terms, and active enrollment sessions</Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Add />} onClick={() => { setFormError(''); setOpenYearModal(true); }}>
            New Academic Year
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setFormError(''); setOpenSemModal(true); }}>
            New Semester
          </Button>
        </Box>
      </Box>

      {feedback.message && (
        <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback({ type: '', message: '' })}>
          {feedback.message}
        </Alert>
      )}

      {/* Selector & Overview */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          select
          label="Select Academic Year"
          size="small"
          value={selectedYearId}
          onChange={(e) => setSelectedYearId(e.target.value)}
          sx={{ minWidth: 260 }}
        >
          {years.map((y) => (
            <MenuItem key={y.id} value={y.id}>
              {y.year_name} {y.is_current ? '(Current Active Year)' : ''}
            </MenuItem>
          ))}
        </TextField>
        <IconButton onClick={() => { fetchYears(); if (selectedYearId) fetchSemesters(selectedYearId); }}>
          <Refresh />
        </IconButton>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell><strong>Semester Name</strong></TableCell>
              <TableCell><strong>Term</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>End Date</strong></TableCell>
              <TableCell><strong>Active Subjects</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingSemesters ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : semesters.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No semesters found for this academic year.</TableCell></TableRow>
            ) : (
              semesters.map((sem) => (
                <TableRow key={sem.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{sem.name}</TableCell>
                  <TableCell><Chip label={sem.term} size="small" variant="outlined" color="primary" /></TableCell>
                  <TableCell>{sem.start_date || 'N/A'}</TableCell>
                  <TableCell>{sem.end_date || 'N/A'}</TableCell>
                  <TableCell>{sem.total_subjects || 0} Subjects</TableCell>
                  <TableCell><Chip label={sem.status} size="small" color={sem.status === 'active' ? 'success' : 'default'} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Academic Year Dialog */}
      <Dialog open={openYearModal} onClose={() => setOpenYearModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Academic Year</DialogTitle>
        <Box component="form" onSubmit={handleCreateYear}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Academic Year Name"
              required
              fullWidth
              placeholder="e.g. 2026-2027"
              value={yearForm.year_name}
              onChange={(e) => setYearForm({ ...yearForm, year_name: e.target.value })}
            />
            <TextField
              label="Start Date"
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={yearForm.start_date}
              onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })}
            />
            <TextField
              label="End Date"
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={yearForm.end_date}
              onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenYearModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Academic Year</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* New Semester Dialog */}
      <Dialog open={openSemModal} onClose={() => setOpenSemModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Semester to Current Year</DialogTitle>
        <Box component="form" onSubmit={handleCreateSemester}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Semester Name"
              required
              fullWidth
              placeholder="e.g. Semester 3 (Fall)"
              value={semForm.name}
              onChange={(e) => setSemForm({ ...semForm, name: e.target.value })}
            />
            <TextField
              label="Term"
              select
              fullWidth
              value={semForm.term}
              onChange={(e) => setSemForm({ ...semForm, term: e.target.value })}
            >
              <MenuItem value="Fall">Fall</MenuItem>
              <MenuItem value="Spring">Spring</MenuItem>
              <MenuItem value="Summer">Summer</MenuItem>
              <MenuItem value="Winter">Winter</MenuItem>
            </TextField>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={semForm.start_date}
              onChange={(e) => setSemForm({ ...semForm, start_date: e.target.value })}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={semForm.end_date}
              onChange={(e) => setSemForm({ ...semForm, end_date: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenSemModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Semester</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

