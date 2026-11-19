import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TablePagination, InputAdornment, Alert, CircularProgress, MenuItem, Tabs, Tab
} from '@mui/material';
import { Search, Add, Refresh, Person, SupervisedUserCircle } from '@mui/icons-material';

export default function UserMappingManager() {
  const [tabIndex, setTabIndex] = useState(0);

  // Lists
  const [studentMappings, setStudentMappings] = useState([]);
  const [facultyAssignments, setFacultyAssignments] = useState([]);

  // Form Dropdowns
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);

  // State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modals
  const [openStudentModal, setOpenStudentModal] = useState(false);
  const [openFacultyModal, setOpenFacultyModal] = useState(false);
  const [formError, setFormError] = useState('');

  const [studentForm, setStudentForm] = useState({
    student_id: '', department_id: '', course_id: '', academic_year_id: '', semester_id: '', roll_number: ''
  });
  const [facultyForm, setFacultyForm] = useState({
    faculty_id: '', subject_id: '', semester_id: '', role_title: 'Lead Instructor'
  });

  const loadDropdowns = async () => {
    try {
      const [deptRes, courseRes, yrRes, semRes, subRes] = await Promise.all([
        fetch('/api/academic/departments?limit=100', { credentials: 'include' }),
        fetch('/api/academic/courses?limit=100', { credentials: 'include' }),
        fetch('/api/academic/academic-years', { credentials: 'include' }),
        fetch('/api/academic/semesters', { credentials: 'include' }),
        fetch('/api/academic/subjects?limit=100', { credentials: 'include' })
      ]);
      const [dData, cData, yData, semData, subData] = await Promise.all([
        deptRes.json(), courseRes.json(), yrRes.json(), semRes.json(), subRes.json()
      ]);
      if (dData.success) setDepartments(dData.data);
      if (cData.success) setCourses(cData.data);
      if (yData.success) setYears(yData.data);
      if (semData.success) setSemesters(semData.data);
      if (subData.success) setSubjects(subData.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudentMappings = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search })
      });
      const res = await fetch(`/api/academic/student-mappings?${q}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStudentMappings(data.data);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load student mappings.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyAssignments = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search })
      });
      const res = await fetch(`/api/academic/faculty-assignments?${q}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setFacultyAssignments(data.data);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load faculty assignments.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (tabIndex === 0) fetchStudentMappings();
    else fetchFacultyAssignments();
  }, [tabIndex, page, rowsPerPage]);

  const handleMapStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.student_id || !studentForm.department_id || !studentForm.course_id || !studentForm.academic_year_id || !studentForm.semester_id) {
      setFormError('Please complete all academic program selection fields.');
      return;
    }
    try {
      const res = await fetch('/api/academic/student-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to map student');
        return;
      }
      setOpenStudentModal(false);
      setFeedback({ type: 'success', message: 'Student mapped to department, course, and semester!' });
      fetchStudentMappings();
    } catch (err) {
      setFormError('Network error');
    }
  };

  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    if (!facultyForm.faculty_id || !facultyForm.subject_id) {
      setFormError('Faculty member and subject are required.');
      return;
    }
    try {
      const res = await fetch('/api/academic/faculty-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(facultyForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to assign faculty');
        return;
      }
      setOpenFacultyModal(false);
      setFeedback({ type: 'success', message: 'Faculty assigned to subject successfully!' });
      fetchFacultyAssignments();
    } catch (err) {
      setFormError('Network error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight="bold" color="primary">Academic User Mappings</Typography>
          <Typography variant="body2" color="text.secondary">Enroll students into courses and assign instructors to subjects</Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setFormError('');
            if (tabIndex === 0) setOpenStudentModal(true);
            else setOpenFacultyModal(true);
          }}
        >
          {tabIndex === 0 ? 'Map Student to Program' : 'Assign Faculty to Subject'}
        </Button>
      </Box>

      {feedback.message && (
        <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback({ type: '', message: '' })}>
          {feedback.message}
        </Alert>
      )}

      <Tabs value={tabIndex} onChange={(_, val) => { setTabIndex(val); setPage(0); setSearch(''); }} sx={{ mb: 3 }}>
        <Tab icon={<Person />} iconPosition="start" label="Student Academic Mappings" />
        <Tab icon={<SupervisedUserCircle />} iconPosition="start" label="Faculty Subject Assignments" />
      </Tabs>

      {/* Search & Actions */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); setPage(0); tabIndex === 0 ? fetchStudentMappings() : fetchFacultyAssignments(); }}
          sx={{ display: 'flex', gap: 1, flexGrow: 1 }}
        >
          <TextField
            size="small"
            placeholder={tabIndex === 0 ? "Search by student name, roll number..." : "Search by faculty name or subject..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ flexGrow: 1 }}
          />
          <Button type="submit" variant="outlined">Search</Button>
        </Box>
        <IconButton onClick={() => { setSearch(''); tabIndex === 0 ? fetchStudentMappings() : fetchFacultyAssignments(); }}>
          <Refresh />
        </IconButton>
      </Paper>

      {/* Tab 0: Student Mappings */}
      {tabIndex === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell><strong>Roll Number</strong></TableCell>
                <TableCell><strong>Student Name</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Course / Degree</strong></TableCell>
                <TableCell><strong>Academic Year & Semester</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : studentMappings.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No student mappings registered.</TableCell></TableRow>
              ) : (
                studentMappings.map((sm) => (
                  <TableRow key={sm.id} hover>
                    <TableCell><Chip label={sm.roll_number || `STU-${sm.student_id}`} size="small" variant="outlined" color="primary" /></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {sm.student_name}
                      <Typography variant="caption" display="block" color="text.secondary">{sm.student_email}</Typography>
                    </TableCell>
                    <TableCell>{sm.department_name}</TableCell>
                    <TableCell>{sm.course_name}</TableCell>
                    <TableCell>{sm.year_name} • {sm.semester_name}</TableCell>
                    <TableCell><Chip label={sm.status} size="small" color={sm.status === 'active' ? 'success' : 'default'} /></TableCell>
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
      )}

      {/* Tab 1: Faculty Assignments */}
      {tabIndex === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell><strong>Faculty Member</strong></TableCell>
                <TableCell><strong>Assigned Subject</strong></TableCell>
                <TableCell><strong>Course Program</strong></TableCell>
                <TableCell><strong>Term / Semester</strong></TableCell>
                <TableCell><strong>Role Title</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : facultyAssignments.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No faculty subject assignments found.</TableCell></TableRow>
              ) : (
                facultyAssignments.map((fa) => (
                  <TableRow key={fa.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {fa.faculty_name}
                      <Typography variant="caption" display="block" color="text.secondary">{fa.faculty_email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={fa.subject_code} size="small" variant="outlined" sx={{ mr: 1 }} />
                      {fa.subject_name}
                    </TableCell>
                    <TableCell>{fa.course_name}</TableCell>
                    <TableCell>{fa.semester_name || 'All terms'}</TableCell>
                    <TableCell><Chip label={fa.role_title} size="small" color="info" /></TableCell>
                    <TableCell><Chip label={fa.status} size="small" color={fa.status === 'active' ? 'success' : 'default'} /></TableCell>
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
      )}

      {/* Student Mapping Dialog */}
      <Dialog open={openStudentModal} onClose={() => setOpenStudentModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Map Student to Academic Program</DialogTitle>
        <Box component="form" onSubmit={handleMapStudent}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Student User ID"
              required
              fullWidth
              type="number"
              placeholder="e.g. 4 (Alice Smith) or 6 (Bob Johnson)"
              value={studentForm.student_id}
              onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })}
              helperText="Pre-seeded sample student user IDs are 4 and 6"
            />
            <TextField
              label="Roll Number"
              fullWidth
              placeholder="e.g. GTU-2026-CS-101"
              value={studentForm.roll_number}
              onChange={(e) => setStudentForm({ ...studentForm, roll_number: e.target.value })}
            />
            <TextField
              select
              label="Department"
              required
              fullWidth
              value={studentForm.department_id}
              onChange={(e) => setStudentForm({ ...studentForm, department_id: e.target.value })}
            >
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name} ({d.code})</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Course / Degree Program"
              required
              fullWidth
              value={studentForm.course_id}
              onChange={(e) => setStudentForm({ ...studentForm, course_id: e.target.value })}
            >
              {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Academic Year"
                required
                fullWidth
                value={studentForm.academic_year_id}
                onChange={(e) => setStudentForm({ ...studentForm, academic_year_id: e.target.value })}
              >
                {years.map((y) => <MenuItem key={y.id} value={y.id}>{y.year_name}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Semester"
                required
                fullWidth
                value={studentForm.semester_id}
                onChange={(e) => setStudentForm({ ...studentForm, semester_id: e.target.value })}
              >
                {semesters.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenStudentModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Map Student</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Faculty Assignment Dialog */}
      <Dialog open={openFacultyModal} onClose={() => setOpenFacultyModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Faculty to Subject</DialogTitle>
        <Box component="form" onSubmit={handleAssignFaculty}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Faculty User ID"
              required
              fullWidth
              type="number"
              placeholder="e.g. 3 (Dr. Alan Turing) or 5 (Dr. Grace Hopper)"
              value={facultyForm.faculty_id}
              onChange={(e) => setFacultyForm({ ...facultyForm, faculty_id: e.target.value })}
              helperText="Pre-seeded sample faculty user IDs are 3 and 5"
            />
            <TextField
              select
              label="Subject"
              required
              fullWidth
              value={facultyForm.subject_id}
              onChange={(e) => setFacultyForm({ ...facultyForm, subject_id: e.target.value })}
            >
              {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.code} - {s.name}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Semester Term (Optional)"
              fullWidth
              value={facultyForm.semester_id}
              onChange={(e) => setFacultyForm({ ...facultyForm, semester_id: e.target.value })}
            >
              <MenuItem value="">All / Unspecified</MenuItem>
              {semesters.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField
              label="Role Title"
              fullWidth
              placeholder="e.g. Lead Instructor, Co-Instructor, Lab Mentor"
              value={facultyForm.role_title}
              onChange={(e) => setFacultyForm({ ...facultyForm, role_title: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenFacultyModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Assign Faculty</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

