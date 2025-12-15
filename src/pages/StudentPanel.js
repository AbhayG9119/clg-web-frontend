import React, { useState } from 'react';
import { FaDotCircle, FaFolder } from 'react-icons/fa';
import Dashboard from '../components/Student Pannel/Dashboard';
import Profile from '../components/Student Pannel/Profile';
import DetailedProfile from '../components/Student Pannel/DetailedProfile';
import UploadPhoto from '../components/Student Pannel/UploadPhoto';
import ViewAssignments from '../components/Student Pannel/ViewAssignments';
import SubmitAssignment from '../components/Student Pannel/SubmitAssignment';
import Circulars from '../components/Student Pannel/Circulars';
import ViewFeeLedger from '../components/Student Pannel/ViewFeeLedger';
import ViewConcessions from '../components/Student Pannel/ViewConcessions';
import ViewNotifications from '../components/Student Pannel/ViewNotifications';
import DownloadReceipts from '../components/Student Pannel/DownloadReceipts';
import ViewFees from '../components/Student Pannel/ViewFees';
import RaiseComplaint from '../components/Student Pannel/RaiseComplaint';
import MyComplaints from '../components/Student Pannel/MyComplaints';
import Attendance from '../components/Student Pannel/Attendance';
import NoticeBoard from '../components/Student Pannel/NoticeBoard';
import ChangePassword from '../components/Student Pannel/ChangePassword';
import UploadDocuments from '../components/Student Pannel/UploadDocuments';
import ViewDocuments from '../components/Student Pannel/ViewDocuments';
import '../styles/AdminPanel.css';

const StudentPanel = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [openMenu, setOpenMenu] = useState(null);

  const menus = [
    { name: 'Dashboard', sub: [] },
    { name: 'Profile', sub: ['Student Profile', 'Detailed Profile'] },
    { name: 'Upload Photo', sub: [] },
    { name: 'Assignments', sub: ['View Assignments', 'Submit Assignment'] },
    { name: 'Circulars', sub: [] },
    { name: 'Fees', sub: ['View Fee Ledger', 'View Concessions', 'View Notifications', 'Download Receipts', 'View Fees'] },
    { name: 'Complaints', sub: ['Raise Complaint', 'My Complaints'] },
    { name: 'Attendance', sub: [] },
    { name: 'Notice Board', sub: [] },
    { name: 'Student Documents', sub: ['Upload Documents', 'View Documents'] },
    { name: 'Change Password', sub: [] }
  ];

  const componentMap = {
    'Dashboard': Dashboard,
    'Student Profile': Profile,
    'Detailed Profile': DetailedProfile,
    'Upload Photo': UploadPhoto,
    'View Assignments': ViewAssignments,
    'Submit Assignment': SubmitAssignment,
    'Circulars': Circulars,
    'View Fee Ledger': ViewFeeLedger,
    'View Concessions': ViewConcessions,
    'View Notifications': ViewNotifications,
    'Download Receipts': DownloadReceipts,
    'View Fees': ViewFees,
    'Raise Complaint': RaiseComplaint,
    'My Complaints': MyComplaints,
    'Attendance': Attendance,
    'Notice Board': NoticeBoard,
    'Upload Documents': UploadDocuments,
    'View Documents': ViewDocuments,
    'Change Password': ChangePassword
  };

  const renderContent = () => {
    const Component = componentMap[activeMenu];
    return Component ? <Component /> : <Dashboard />;
  };

  const handleSubClick = (subName) => {
    setActiveMenu(subName);
  };

  const handleMainClick = (menu) => {
    if (menu.sub.length === 0) {
      setActiveMenu(menu.name);
      setOpenMenu(null);
    } else {
      setOpenMenu(prev => prev === menu.name ? null : menu.name);
    }
  };

  return (
    <div className="admin-panel">
      <nav className="side-nav">
        <h2>Student Panel</h2>
        <ul className="nav-menu">
          {menus.map(menu => (
            <li key={menu.name} className={menu.sub.length > 0 && openMenu === menu.name ? 'open' : ''}>
              <button
                className={menu.sub.length === 0 && activeMenu === menu.name ? 'active' : ''}
                onClick={() => handleMainClick(menu)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {menu.sub.length === 0 ? <FaDotCircle /> : <FaFolder />} {menu.name}
                </div>
                {menu.sub.length > 0 && (
                  <span className={`arrow ${openMenu === menu.name ? 'rotated' : ''}`}>▼</span>
                )}
              </button>
              {menu.sub.length > 0 && (
                <ul className={`sub-menu ${openMenu === menu.name ? 'open' : ''}`}>
                  {menu.sub.map(sub => (
                    <li key={sub}>
                      <button
                        className={activeMenu === sub ? 'active' : ''}
                        onClick={() => handleSubClick(sub)}
                      >
                        {sub}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <main className="content" style={{ marginTop: '80px' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default StudentPanel;
