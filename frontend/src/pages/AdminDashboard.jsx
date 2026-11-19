import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Button, Card, CardContent, Grid, Chip, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress
} from '@mui/material';
import {
  Business, CalendarToday, School, People, Logout, Dashboard as DashIcon,
  MenuBook, AccountCircle, Domain
} from '@mui/icons-material';

import DepartmentManager from './DepartmentManager.jsx';
import AcademicYearManager from './AcademicYearManager.jsx';
import CourseSubjectManager from './CourseSubjectManager.jsx';
import UserMappingManager from './UserMappingManager.jsx';
import UniversityManager from './UniversityManager.jsx';

const drawerWidth = 260;

export default function AdminDashboard({ user, onLogout }) {
  const role = user?.role || 'Student';
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Role-based sidebar menu definition
  const getMenuItems = () => {
    const base = [{ id: 'overview', label: 'Dashboard Overview', icon: <DashIcon /> }];

    if (role === 'Super Admin') {
      base.push(
        { id: 'universities', label: 'Universities', icon: <Domain /> },
        { id: 'departments', label: 'Departments', icon: <Business /> },
        { id: 'academics', label: 'Academic Years', icon: <CalendarToday /> },
        { id: 'courses', label: 'Courses & Subjects', icon: <School /> },
        { id: 'mappings', label: 'User Mappings', icon: <People /> }
      );
    } else if (role === 'University Admin') {
      base.push(
        { id: 'departments', label: 'Departments', icon: <Business /> },
        { id: 'academics', label: 'Academic Years & Terms', icon: <CalendarToday /> },
        { id: 'courses', label: 'Courses & Subjects', icon: <School /> },
        { id: 'mappings', label: 'Student & Faculty Mappings', icon: <People /> }
      );
    } else if (role === 'Faculty') {
      base.push(
        { id: 'courses', label: 'Courses & Curriculum', icon: <School /> }
      );
    } else if (role === 'Student') {
      base.push(
        { id: 'courses', label: 'My Enrolled Courses', icon: <School /> }
      );
    }

    return base;
  };

  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/dashboard/overview', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setOverviewData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview();
    }
  }, [activeTab]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      {/* Top Navbar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1a2b55' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img src="/logo.jpg" alt="Logo" style={{ height: 38, borderRadius: 4 }} />
            <div>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                LMS Academic Portal
              </Typography>
              <Typography variant="caption" sx={{ color: '#90caf9' }}>
                {user?.university?.name || (role === 'Super Admin' ? 'Multi-Tenant Global Governance' : 'Academic Portal')}
              </Typography>
            </div>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.full_name}</Typography>
              <Chip label={user?.role} size="small" sx={{ bgcolor: '#f25822', color: '#fff', fontWeight: 'bold' }} />
            </Box>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<Logout />}
              onClick={onLogout}
              sx={{ borderColor: 'rgba(255,255,255,0.4)', textTransform: 'none' }}
            >
              Sign Out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Role-Specific Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#ffffff' },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="caption" color="text.secondary">LOGGED IN AS</Typography>
          <Typography variant="subtitle2" fontWeight="bold">{user?.full_name}</Typography>
          <Typography variant="caption" color="primary">{user?.email}</Typography>
        </Box>
        <Box sx={{ overflow: 'auto', p: 1.5 }}>
          <List>
            {getMenuItems().map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.8 }}>
                <ListItemButton
                  selected={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: '#e3f2fd',
                      color: '#1565c0',
                      fontWeight: 'bold',
                      '& .MuiListItemIcon-root': { color: '#1565c0' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.id ? '#1565c0' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: activeTab === item.id ? 700 : 500 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)` }}>
        <Toolbar />

        {/* 1. OVERVIEW DASHBOARDS BY ROLE */}
        {activeTab === 'overview' && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {role} Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back, {user?.full_name}! Here is your personalized portal view.
              </Typography>
            </Box>

            {loadingOverview ? (
              <CircularProgress size={32} />
            ) : (
              <>
                {/* SUPER ADMIN OVERVIEW */}
                {role === 'Super Admin' && overviewData && (
                  <Box>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} sm={4}>
                        <Card elevation={2}>
                          <CardContent>
                            <Typography variant="overline" color="text.secondary">Total Universities</Typography>
                            <Typography variant="h4" fontWeight="bold" color="primary">{overviewData.stats?.totalUniversities || 0}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Card elevation={2}>
                          <CardContent>
                            <Typography variant="overline" color="text.secondary">Total User Accounts</Typography>
                            <Typography variant="h4" fontWeight="bold" color="secondary">{overviewData.stats?.totalUsers || 0}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Card elevation={2}>
                          <CardContent>
                            <Typography variant="overline" color="text.secondary">University Admins</Typography>
                            <Typography variant="h4" fontWeight="bold" color="success.main">{overviewData.stats?.totalUniversityAdmins || 0}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Registered Institutions</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell><strong>Code</strong></TableCell>
                            <TableCell><strong>University Name</strong></TableCell>
                            <TableCell><strong>Total Accounts</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {overviewData.recentUniversities?.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell><Chip label={u.code} size="small" variant="outlined" color="primary" /></TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                              <TableCell>{u.user_count} Users</TableCell>
                              <TableCell><Chip label={u.status} size="small" color={u.status === 'active' ? 'success' : 'default'} /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* UNIVERSITY ADMIN OVERVIEW */}
                {role === 'University Admin' && overviewData && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={3}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="overline" color="text.secondary">Departments</Typography>
                          <Typography variant="h4" fontWeight="bold" color="primary">{overviewData.stats?.totalDepartments || 0}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="overline" color="text.secondary">Degree Programs</Typography>
                          <Typography variant="h4" fontWeight="bold" color="secondary">{overviewData.stats?.totalCourses || 0}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="overline" color="text.secondary">Faculty Staff</Typography>
                          <Typography variant="h4" fontWeight="bold" color="success.main">{overviewData.stats?.totalFaculty || 0}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="overline" color="text.secondary">Enrolled Students</Typography>
                          <Typography variant="h4" fontWeight="bold" color="info.main">{overviewData.stats?.totalStudents || 0}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {/* FACULTY OVERVIEW */}
                {role === 'Faculty' && overviewData && (
                  <Box>
                    <Card elevation={2} sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="overline" color="text.secondary">My Teaching Assignments</Typography>
                        <Typography variant="h4" fontWeight="bold" color="primary">{overviewData.stats?.totalAssignedSubjects || 0} Subjects</Typography>
                      </CardContent>
                    </Card>

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Assigned Curriculum Subjects</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell><strong>Subject Code</strong></TableCell>
                            <TableCell><strong>Subject Name</strong></TableCell>
                            <TableCell><strong>Degree Program</strong></TableCell>
                            <TableCell><strong>Semester</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {overviewData.subjects?.map((s, idx) => (
                            <TableRow key={idx}>
                              <TableCell><Chip label={s.subject_code} size="small" variant="outlined" color="primary" /></TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{s.subject_name}</TableCell>
                              <TableCell>{s.course_name}</TableCell>
                              <TableCell>{s.semester_name || 'All terms'}</TableCell>
                              <TableCell><Chip label={s.role_title} size="small" color="info" /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* STUDENT OVERVIEW */}
                {role === 'Student' && overviewData && (
                  <Box>
                    <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffffff', borderLeft: '4px solid #1a2b55' }}>
                      <Typography variant="h6" fontWeight="bold">Active Enrollment Profile</Typography>
                      {overviewData.enrollment ? (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">ROLL NUMBER</Typography>
                            <Typography variant="body1" fontWeight="bold">{overviewData.enrollment.roll_number}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">DEPARTMENT</Typography>
                            <Typography variant="body1">{overviewData.enrollment.department_name}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">DEGREE PROGRAM</Typography>
                            <Typography variant="body1">{overviewData.enrollment.course_name}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">ACADEMIC TERM</Typography>
                            <Typography variant="body1">{overviewData.enrollment.year_name} ({overviewData.enrollment.semester_name})</Typography>
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography color="text.secondary">No active program enrollment assigned yet.</Typography>
                      )}
                    </Paper>

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Curriculum Subjects</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell><strong>Code</strong></TableCell>
                            <TableCell><strong>Subject Title</strong></TableCell>
                            <TableCell><strong>Credits</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {overviewData.subjects?.map((sub) => (
                            <TableRow key={sub.id}>
                              <TableCell><Chip label={sub.code} size="small" variant="outlined" color="primary" /></TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{sub.name}</TableCell>
                              <TableCell>{sub.credits} Credits</TableCell>
                              <TableCell><Chip label={sub.type} size="small" /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}

        {/* 2. MANAGEMENT MODULES */}
        {activeTab === 'universities' && <UniversityManager />}
        {activeTab === 'departments' && <DepartmentManager />}
        {activeTab === 'academics' && <AcademicYearManager />}
        {activeTab === 'courses' && <CourseSubjectManager />}
        {activeTab === 'mappings' && <UserMappingManager />}
      </Box>
    </Box>
  );
}
