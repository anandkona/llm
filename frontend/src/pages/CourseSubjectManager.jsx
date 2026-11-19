import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TablePagination, InputAdornment, Alert, CircularProgress, MenuItem, Tabs, Tab
} from '@mui/material';
import { Search, Add, Refresh, School, Book } from '@mui/icons-material';

export default function CourseSubjectManager() {
  const [tabIndex, setTabIndex] = useState(0);

  // Data
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Dialogs
  const [openCourseModal, setOpenCourseModal] = useState(false);
  const [openSubjectModal, setOpenSubjectModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ department_id: '', name: '', code: '', duration_years: 4, total_semesters: 8 });
  const [subjectForm, setSubjectForm] = useState({ course_id: '', semester_id: '', name: '', code: '', credits: 3, type: 'Theory' });
  const [formError, setFormError] = useState('');

  // Dropdown metadata
  const fetchMetadata = async () => {
    try {
      const [deptRes, semRes] = await Promise.all([
        fetch('/api/academic/departments?limit=100', { credentials: 'include' }),
        fetch('/api/academic/semesters', { credentials: 'include' })
      ]);
      const [deptData, semData] = await Promise.all([deptRes.json(), semRes.json()]);
      if (deptData.success) setDepartments(deptData.data);
      if (semData.success) setSemesters(semData.data);
    } catch (e) {
      console.error('Metadata load failed', e);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(deptFilter && { department_id: deptFilter })
      });
      const res = await fetch(`/api/academic/courses?${q}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to fetch courses.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(courseFilter && { course_id: courseFilter })
      });
      const res = await fetch(`/api/academic/subjects?${q}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSubjects(data.data);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to fetch subjects.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (tabIndex === 0) fetchCourses();
    else fetchSubjects();
  }, [tabIndex, page, rowsPerPage, deptFilter, courseFilter]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.department_id || !courseForm.name || !courseForm.code) {
      setFormError('Department, course name, and code are required.');
      return;
    }
    try {
      const res = await fetch('/api/academic/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to create course');
        return;
      }
      setOpenCourseModal(false);
      setFeedback({ type: 'success', message: 'Course created successfully!' });
      fetchCourses();
    } catch (err) {
      setFormError('Network error');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.course_id || !subjectForm.name || !subjectForm.code) {
      setFormError('Course, subject name, and code are required.');
      return;
    }
    try {
      const res = await fetch('/api/academic/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(subjectForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to create subject');
        return;
      }
      setOpenSubjectModal(false);
      setFeedback({ type: 'success', message: 'Subject created successfully!' });
      fetchSubjects();
    } catch (err) {
      setFormError('Network error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight="bold" color="primary">Course & Subject Management</Typography>
          <Typography variant="body2" color="text.secondary">Create degrees, programs, curriculums, and instructional subjects</Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setFormError('');
            if (tabIndex === 0) setOpenCourseModal(true);
            else setOpenSubjectModal(true);
          }}
        >
          {tabIndex === 0 ? 'Add Course Program' : 'Add Subject'}
        </Button>
      </Box>

      {feedback.message && (
        <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback({ type: '', message: '' })}>
          {feedback.message}
        </Alert>
      )}

      <Tabs value={tabIndex} onChange={(_, val) => { setTabIndex(val); setPage(0); setSearch(''); }} sx={{ mb: 3 }}>
        <Tab icon={<School />} iconPosition="start" label="Degree Programs (Courses)" />
        <Tab icon={<Book />} iconPosition="start" label="Curriculum Subjects" />
      </Tabs>

      {/* Filter bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box
          component="form"
          onSubmit={(e) => { e.preventDefault(); setPage(0); tabIndex === 0 ? fetchCourses() : fetchSubjects(); }}
          sx={{ display: 'flex', gap: 1, flexGrow: 1 }}
        >
          <TextField
            size="small"
            placeholder={`Search ${tabIndex === 0 ? 'courses' : 'subjects'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ flexGrow: 1 }}
          />
          <Button type="submit" variant="outlined">Search</Button>
        </Box>

        {tabIndex === 0 ? (
          <TextField
            select
            size="small"
            label="Department"
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name} ({d.code})</MenuItem>)}
          </TextField>
        ) : (
          <TextField
            select
            size="small"
            label="Course"
            value={courseFilter}
            onChange={(e) => { setCourseFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Courses</MenuItem>
            {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        )}

        <IconButton onClick={() => { setSearch(''); setDeptFilter(''); setCourseFilter(''); tabIndex === 0 ? fetchCourses() : fetchSubjects(); }}>
          <Refresh />
        </IconButton>
      </Paper>

      {/* Tab 0: Courses Table */}
      {tabIndex === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell><strong>Course Code</strong></TableCell>
                <TableCell><strong>Program Name</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Duration</strong></TableCell>
                <TableCell><strong>Curriculum Subjects</strong></TableCell>
                <TableCell><strong>Enrolled Students</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : courses.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No courses found.</TableCell></TableRow>
              ) : (
                courses.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell><Chip label={c.code} size="small" variant="outlined" color="primary" /></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                    <TableCell>{c.department_name}</TableCell>
                    <TableCell>{c.duration_years} Years ({c.total_semesters} Semesters)</TableCell>
                    <TableCell>{c.total_subjects || 0} Subjects</TableCell>
                    <TableCell>{c.enrolled_students || 0} Students</TableCell>
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

      {/* Tab 1: Subjects Table */}
      {tabIndex === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell><strong>Code</strong></TableCell>
                <TableCell><strong>Subject Title</strong></TableCell>
                <TableCell><strong>Course</strong></TableCell>
                <TableCell><strong>Semester</strong></TableCell>
                <TableCell><strong>Credits & Type</strong></TableCell>
                <TableCell><strong>Assigned Faculty</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : subjects.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No subjects found.</TableCell></TableRow>
              ) : (
                subjects.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell><Chip label={s.code} size="small" variant="outlined" color="secondary" /></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                    <TableCell>{s.course_name}</TableCell>
                    <TableCell>{s.semester_name || 'General'}</TableCell>
                    <TableCell>{s.credits} Credits • {s.type}</TableCell>
                    <TableCell>
                      {s.assigned_faculty ? (
                        <Chip label={s.assigned_faculty} size="small" color="primary" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                      )}
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
      )}

      {/* Course Modal */}
      <Dialog open={openCourseModal} onClose={() => setOpenCourseModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Degree Program / Course</DialogTitle>
        <Box component="form" onSubmit={handleCreateCourse}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              select
              label="Department"
              required
              fullWidth
              value={courseForm.department_id}
              onChange={(e) => setCourseForm({ ...courseForm, department_id: e.target.value })}
            >
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name} ({d.code})</MenuItem>)}
            </TextField>
            <TextField
              label="Program / Course Name"
              required
              fullWidth
              placeholder="e.g. B.Tech in Computer Science"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            />
            <TextField
              label="Course Code"
              required
              fullWidth
              placeholder="e.g. BT-CSE"
              value={courseForm.code}
              onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Duration (Years)"
                type="number"
                fullWidth
                value={courseForm.duration_years}
                onChange={(e) => setCourseForm({ ...courseForm, duration_years: e.target.value })}
              />
              <TextField
                label="Total Semesters"
                type="number"
                fullWidth
                value={courseForm.total_semesters}
                onChange={(e) => setCourseForm({ ...courseForm, total_semesters: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenCourseModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Program</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Subject Modal */}
      <Dialog open={openSubjectModal} onClose={() => setOpenSubjectModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Curriculum Subject</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubject}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              select
              label="Associated Course"
              required
              fullWidth
              value={subjectForm.course_id}
              onChange={(e) => setSubjectForm({ ...subjectForm, course_id: e.target.value })}
            >
              {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name} ({c.code})</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Semester"
              fullWidth
              value={subjectForm.semester_id}
              onChange={(e) => setSubjectForm({ ...subjectForm, semester_id: e.target.value })}
            >
              <MenuItem value="">Not specific</MenuItem>
              {semesters.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} ({s.year_name})</MenuItem>)}
            </TextField>
            <TextField
              label="Subject Name"
              required
              fullWidth
              placeholder="e.g. Operating Systems"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
            />
            <TextField
              label="Subject Code"
              required
              fullWidth
              placeholder="e.g. CS201"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Credits"
                type="number"
                fullWidth
                value={subjectForm.credits}
                onChange={(e) => setSubjectForm({ ...subjectForm, credits: e.target.value })}
              />
              <TextField
                select
                label="Course Type"
                fullWidth
                value={subjectForm.type}
                onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
              >
                <MenuItem value="Theory">Theory</MenuItem>
                <MenuItem value="Practical">Practical</MenuItem>
                <MenuItem value="Theory & Practical">Theory & Practical</MenuItem>
                <MenuItem value="Elective">Elective</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenSubjectModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Subject</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

