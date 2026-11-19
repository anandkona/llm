import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TablePagination, InputAdornment, Alert, CircularProgress, MenuItem
} from '@mui/material';
import { Search, Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { apiFetch } from '../services/api.js';

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  // Dialog State
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '', status: 'active' });
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter })
      });
      const res = await apiFetch(`/api/academic/departments?${queryParams}`);
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load departments.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, rowsPerPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDepartments();
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', code: '', description: '', status: 'active' });
    setFormError('');
    setOpenModal(true);
  };

  const handleOpenEdit = (dept) => {
    setIsEditing(true);
    setEditId(dept.id);
    setFormData({ name: dept.name, code: dept.code, description: dept.description || '', status: dept.status });
    setFormError('');
    setOpenModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError('Department name and code are required.');
      return;
    }

    try {
      const url = isEditing ? `/api/academic/departments/${editId}` : '/api/academic/departments';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });
      const resData = await res.json();

      if (!res.ok || !resData.success) {
        setFormError(resData.error || 'Operation failed');
        return;
      }

      setOpenModal(false);
      setFeedback({ type: 'success', message: `Department ${isEditing ? 'updated' : 'created'} successfully!` });
      fetchDepartments();
    } catch (err) {
      setFormError('Network error occurred.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete department: ${name}?`)) return;

    try {
      const res = await apiFetch(`/api/academic/departments/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Department removed successfully.' });
        fetchDepartments();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to delete department' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error deleting department' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight="bold" color="primary">Department Management</Typography>
          <Typography variant="body2" color="text.secondary">Configure academic departments, faculties, and codes</Typography>
        </div>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate} sx={{ textTransform: 'none' }}>
          Add Department
        </Button>
      </Box>

      {feedback.message && (
        <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback({ type: '', message: '' })}>
          {feedback.message}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          <TextField
            size="small"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ flexGrow: 1 }}
          />
          <Button type="submit" variant="outlined" sx={{ textTransform: 'none' }}>Search</Button>
        </Box>

        <TextField
          size="small"
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>

        <IconButton onClick={() => { setSearch(''); setStatusFilter(''); fetchDepartments(); }} title="Refresh">
          <Refresh />
        </IconButton>
      </Paper>

      {/* Table Presentation */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>Department Name</strong></TableCell>
              <TableCell><strong>Courses</strong></TableCell>
              <TableCell><strong>Enrolled Students</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : departments.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No departments found.</TableCell></TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id} hover>
                  <TableCell><Chip label={dept.code} size="small" variant="outlined" color="primary" /></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{dept.name}</TableCell>
                  <TableCell>{dept.total_courses || 0} Programs</TableCell>
                  <TableCell>{dept.total_students || 0} Students</TableCell>
                  <TableCell>
                    <Chip
                      label={dept.status}
                      size="small"
                      color={dept.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(dept)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(dept.id, dept.name)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>

      {/* Form Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Department' : 'Create Academic Department'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Department Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Electrical & Computer Engineering"
            />
            <TextField
              label="Department Code"
              required
              fullWidth
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. ECE"
              helperText="Unique uppercase identifier"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Status"
              select
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{isEditing ? 'Save Changes' : 'Create'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

