import React, { useState, useEffect } from 'react';
import { FaDotCircle, FaFolder } from 'react-icons/fa';
import StaffSidebar from '../components/Staff Pannel/StaffSidebar';
import Dashboard from '../components/Staff Pannel/Dashboard';
import Profile from '../components/Staff Pannel/Profile';
import UploadPhoto from '../components/Staff Pannel/UploadPhoto';
import CreateAssignment from '../components/Staff Pannel/CreateAssignment';
import ViewAssignments from '../components/Staff Pannel/ViewAssignments';
import Circulars from '../components/Staff Pannel/Circulars';
import MarkAttendance from '../components/Staff Pannel/MarkAttendance';
import AttendanceReport from '../components/Staff Pannel/AttendanceReport';
import Messaging from '../components/Staff Pannel/Messaging';
import ReportCard from '../components/Staff Pannel/ReportCard';
import Settings from '../components/Staff Pannel/Settings';
import LeaveManagement from '../components/Staff Pannel/LeaveManagement';
import Timetable from '../components/Staff Pannel/Timetable';
import Payroll from '../components/Staff Pannel/Payroll';
import AssignClass from '../components/Staff Pannel/AssignClass';
import StaffViewDocuments from '../components/Staff Pannel/StaffViewDocuments';
import StaffVerifyDocuments from '../components/Staff Pannel/StaffVerifyDocuments';
import ViewFees from '../components/Student Pannel/ViewFees';
import CollectFees from '../components/AdminPanel/CollectFees';
import ManageReceipts from '../components/AdminPanel/ManageReceipts';
import DuplicateReceipts from '../components/AdminPanel/DuplicateReceipts';
import CancelReceipt from '../components/AdminPanel/CancelReceipt';
import TotalFeeCollectionSummary from '../components/Staff Pannel/TotalFeeCollectionSummary';
import ActivePendingOverdueFees from '../components/Staff Pannel/ActivePendingOverdueFees';
import '../styles/StaffPanel.css';

const StaffPanel = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [openMenu, setOpenMenu] = useState(null);
  const [userDesignation, setUserDesignation] = useState('');

  useEffect(() => {
    const fetchUserDesignation = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserDesignation(payload.designation || '');
        } catch (error) {
          console.error('Error parsing token:', error);
          // Fallback to API call if token parsing fails
          try {
            const { auth } = await import('../services/adminApi');
            const response = await auth.getCurrentUser();
            if (response.success) {
              setUserDesignation(response.data.designation || '');
            }
          } catch (apiError) {
            console.error('Error fetching user info:', apiError);
          }
        }
      }
    };
    fetchUserDesignation();
  }, []);

  const baseMenus = [
    { name: 'Dashboard', sub: [] },
    { name: 'Profile Management', sub: ['Profile', 'Upload Photo', 'Contact Info'] },
    { name: 'Class Assignment Management', sub: ['Assign Class/Subject', 'View Assignments'] },
    { name: 'Attendance Management', sub: ['Attendance Entry', 'Attendance View', 'Daily/Monthly Reports'] },
    { name: 'Leave Management', sub: ['Apply for Leave', 'View Leave History'] },
    { name: 'Messaging', sub: ['Send/Receive Messages', 'Alerts'] },
    { name: 'Timetable', sub: [] },
    { name: 'Circular/Notices', sub: ['View Notices', 'Download'] },
    { name: 'Work Management', sub: ['Assignments', 'Reports'] },
    { name: 'Student Documents', sub: ['View Documents', 'Verify Documents'] },
    { name: 'Report Card', sub: [] },
    { name: 'Payroll', sub: ['View Salary', 'Payslip'] },
    { name: 'Settings', sub: ['Preferences', 'Logout'] }
  ];

  const feesMenu = { name: 'Fees', sub: ['Collect Fees', 'Manage Receipts', 'Duplicate Receipts', 'Cancel Receipt', 'Total Fee Collection Summary', 'Active/Pending/Overdue Fees'] };

  const menus = userDesignation === 'Fees Administrator' ? [...baseMenus.slice(0, 9), feesMenu, ...baseMenus.slice(9)] : baseMenus;

  const componentMap = {
    'Dashboard': Dashboard,
    'Profile': Profile,
    'Upload Photo': UploadPhoto,
    'Assign Class/Subject': AssignClass,
    'View Assignments': ViewAssignments,
    'Attendance Entry': MarkAttendance,
    'Attendance View': AttendanceReport,
    'Daily/Monthly Reports': AttendanceReport,
    'Apply for Leave': LeaveManagement,
    'View Leave History': LeaveManagement,
    'Send/Receive Messages': Messaging,
    'Alerts': Messaging,
    'Timetable': Timetable,
    'View Notices': Circulars,
    'Download': Circulars,
    'Assignments': CreateAssignment,
    'Reports': ViewAssignments,
    'View Documents': StaffViewDocuments,
    'Verify Documents': StaffVerifyDocuments,
    'Collect Fees': CollectFees,
    'Manage Receipts': ManageReceipts,
    'Duplicate Receipts': DuplicateReceipts,
    'Cancel Receipt': CancelReceipt,
    'Total Fee Collection Summary': TotalFeeCollectionSummary,
    'Active/Pending/Overdue Fees': ActivePendingOverdueFees,
    'Detailed Transactions Report': () => (
      <div>
        <h2>Detailed Transactions Report</h2>
        <p>Sabhi students ke individual transactions: date, amount, mode (cash, card, online), payment status.</p>
        <p>Filters for courses, batches, payment dates, fee status.</p>
      </div>
    ),
    'Fee Structure Management': () => (
      <div>
        <h2>Fee Structure Management</h2>
        <p>Create/update fee heads and amounts for every course/batch/semester/year.</p>
        <p>Change history log (kis admin/staff ne kya update kiya).</p>
      </div>
    ),
    'Receipt Management': () => (
      <div>
        <h2>Receipt Management</h2>
        <p>Generate, view, download, print receipts for all transactions.</p>
        <p>Re-issue or correct receipts (with approval system).</p>
      </div>
    ),
    'Scholarship/Concession Monitoring': () => (
      <div>
        <h2>Scholarship/Concession Monitoring</h2>
        <p>Kis student ko kya concession/scholarship mila, total concession amount ka summary.</p>
      </div>
    ),
    'Refund/Adjustment Tracking': () => (
      <div>
        <h2>Refund/Adjustment Tracking</h2>
        <p>Kis cases me refund/adjustment hua, reason, approval status.</p>
      </div>
    ),
    'Alerts & Notifications': () => (
      <div>
        <h2>Alerts & Notifications</h2>
        <p>Due fee reminders, overdue alerts, communication logs (SMS, Email).</p>
      </div>
    ),
    'Audit Log': () => (
      <div>
        <h2>Audit Log</h2>
        <p>All changes/actions performed in fee system—complete activity trail.</p>
      </div>
    ),
    'Export Reports': () => (
      <div>
        <h2>Export Reports</h2>
        <p>Download reports in PDF/Excel (collection, dues, batch-wise, etc.).</p>
      </div>
    ),
    'Role/Permission Management': () => (
      <div>
        <h2>Role/Permission Management</h2>
        <p>Kis staff/admin ko kya access hai—user management panel.</p>
      </div>
    ),
    'Report Card': ReportCard,
    'View Salary': Payroll,
    'Payslip': Payroll,
    'Preferences': Settings,
    'Logout': () => { localStorage.removeItem('token'); window.location.href = '/login'; }
  };

  const renderContent = () => {
    const Component = componentMap[activeMenu];
    if (typeof Component === 'function' && Component.name === 'Logout') {
      Component();
      return <div>Logging out...</div>;
    }
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
        <h2>Staff Panel</h2>
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
      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
};

export default StaffPanel;
