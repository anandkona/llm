import React, { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider, IconButton, Button, Avatar
} from '@mui/material';
import {
  Business, CalendarToday, School, People, Logout, Dashboard
} from '@mui/icons-material';

import DepartmentManager from './DepartmentManager.jsx';
import AcademicYearManager from './AcademicYearManager.jsx';
import CourseSubjectManager from './CourseSubjectManager.jsx';
import UserMappingManager from './UserMappingManager.jsx';

const drawerWidth = 260;

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('departments');

  const menuItems = [
    { id: 'departments', label: 'Departments', icon: <Business /> },
    { id: 'academics', label: 'Academic Years & Terms', icon: <CalendarToday /> },
    { id: 'courses', label: 'Courses & Subjects', icon: <School /> },
    { id: 'mappings', label: 'Student & Faculty Mappings', icon: <People /> },
  ];

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
                {user?.university?.name || 'Academic Management Console'}
              </Typography>
            </div>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.full_name}</Typography>
              <Typography variant="caption" sx={{ color: '#cfd8dc' }}>{user?.role}</Typography>
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

      {/* Sidebar Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#ffffff' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 1.5 }}>
          <List>
            {menuItems.map((item) => (
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
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: activeTab === item.id ? 700 : 500 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Screen Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)` }}>
        <Toolbar />
        {activeTab === 'departments' && <DepartmentManager />}
        {activeTab === 'academics' && <AcademicYearManager />}
        {activeTab === 'courses' && <CourseSubjectManager />}
        {activeTab === 'mappings' && <UserMappingManager />}
      </Box>
    </Box>
  );
}

