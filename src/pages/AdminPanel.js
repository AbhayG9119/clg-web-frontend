import React, { useState } from 'react';
import { FaDotCircle, FaFolder } from 'react-icons/fa';
import Dashboard from '../components/AdminPanel/Dashboard';
import UserManagement from '../components/AdminPanel/UserManagement';
import AcademicManagement from '../components/AdminPanel/AcademicManagement';
import Admission from '../components/AdminPanel/Admission';
import FeesManagement from '../components/AdminPanel/FeesManagement';
import Circulars from '../components/AdminPanel/Circulars';
import StaffManagement from '../components/AdminPanel/StaffManagement';
import WorkManagement from '../components/AdminPanel/WorkManagement';
import ExpenseManagement from '../components/AdminPanel/ExpenseManagement';
import EnquiryManagement from '../components/AdminPanel/EnquiryManagement';
import Certificates from '../components/AdminPanel/Certificates';
import Reports from '../components/AdminPanel/Reports';
import Permissions from '../components/AdminPanel/Permissions';
import Payroll from '../components/AdminPanel/Payroll';
import Cards from '../components/AdminPanel/Cards';
import AddUser from '../components/AdminPanel/AddUser';
import ManageUsers from '../components/AdminPanel/ManageUsers';
import SessionManagement from '../components/AdminPanel/SessionManagement';
import ManageFees from '../components/AdminPanel/ManageFees';
import ManageConcessions from '../components/AdminPanel/ManageConcessions';
import ManageReceipts from '../components/AdminPanel/ManageReceipts';
import ManageNotifications from '../components/AdminPanel/ManageNotifications';
import FeeCollectionSummary from '../components/AdminPanel/FeeCollectionSummary';
import FeeStatusOverview from '../components/AdminPanel/FeeStatusOverview';
import TransportRoutesFare from '../components/AdminPanel/TransportRoutesFare';
import HostelFees from '../components/AdminPanel/HostelFees';
import GenerateDiscount from '../components/AdminPanel/GenerateDiscount';
import AddSubject from '../components/AdminPanel/AddSubject';
import Registration from '../components/AdminPanel/Registration';
import NewAdmission from '../components/AdminPanel/NewAdmission';
import CollectFees from '../components/AdminPanel/CollectFees';
import DuplicateReceipts from '../components/AdminPanel/DuplicateReceipts';
import CancelReceipt from '../components/AdminPanel/CancelReceipt';
import ChangeHostelTransport from '../components/AdminPanel/ChangeHostelTransport';
import AddDesignation from '../components/AdminPanel/AddDesignation';
import RegisterStaff from '../components/AdminPanel/RegisterStaff';
import StaffAttendance from '../components/AdminPanel/StaffAttendance';
import AssignClass from '../components/AdminPanel/AssignClass';
import LeaveDays from '../components/AdminPanel/LeaveDays';
import AddWork from '../components/AdminPanel/AddWork';
import AddWorkReport from '../components/AdminPanel/AddWorkReport';
import AssignWork from '../components/AdminPanel/AssignWork';
import StaffWorkDetails from '../components/AdminPanel/StaffWorkDetails';
import StaffWorkUpdates from '../components/AdminPanel/StaffWorkUpdates';
import ExpenseEntry from '../components/AdminPanel/ExpenseEntry';
import ExpenseReports from '../components/AdminPanel/ExpenseReports';
import AddEnquiry from '../components/AdminPanel/AddEnquiry';
import EnquiryDetail from '../components/AdminPanel/EnquiryDetail';
import EnquiryFollowUp from '../components/AdminPanel/EnquiryFollowUp';
import AddVisitor from '../components/AdminPanel/AddVisitor';
import VisitedList from '../components/AdminPanel/VisitedList';
import TransferCertificate from '../components/AdminPanel/TransferCertificate';
import CharacterCertificate from '../components/AdminPanel/CharacterCertificate';
import SalarySettings from '../components/AdminPanel/SalarySettings';
import GenerateSalary from '../components/AdminPanel/GenerateSalary';
import GeneratePayslip from '../components/AdminPanel/GeneratePayslip';
import PrintIDCard from '../components/AdminPanel/PrintIDCard';
import GenerateAdmitCard from '../components/AdminPanel/GenerateAdmitCard';
import PrintAdmitCard from '../components/AdminPanel/PrintAdmitCard';
import ExaminationCenter from '../components/AdminPanel/ExaminationCenter';
import AdmissionQuery from '../components/AdminPanel/AdmissionQuery';
import ContactUs from '../components/AdminPanel/ContactUs';
import NCCQuery from '../components/AdminPanel/NCCQuery';
import ViewDocuments from '../components/AdminPanel/ViewDocuments';
import VerifyDocuments from '../components/AdminPanel/VerifyDocuments';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [openMenu, setOpenMenu] = useState(null);

  const menus = [
    { name: 'Dashboard', sub: [] },
    { name: 'User Management', sub: ['Add User', 'Manage Users'] },
    { name: 'Academic Management', sub: ['Session Management', 'Manage Fees', 'Manage Concessions', 'Transport Routes & Fare', 'Hostel Fees', 'Generate Discount', 'Add Subject'] },
    { name: 'Registration & Admission', sub: ['Registration', 'New Admission'] },
    { name: 'Fees & Receipts', sub: ['Collect Fees', 'Manage Receipts', 'Duplicate Receipt', 'Cancel Receipt', 'Change Hostel/Transport', 'Fee Collection Summary', 'Fee Status Overview'] },
    { name: 'Notifications', sub: [] },
    { name: 'Circulars / Notice', sub: [] },
    { name: 'Staff Management', sub: ['Add Designation', 'Register Staff', 'Staff Attendance', 'Assign Class', 'Leave Days'] },
    { name: 'Work Management', sub: ['Add Work', 'Add Work Report', 'Assign Work', 'Staff Work Details', 'Staff Work Updates'] },
    { name: 'Expense Management', sub: ['Expense Entry', 'Expense Reports'] },
    { name: 'Enquiry Management', sub: ['Add Enquiry', 'Enquiry Detail', 'Enquiry Follow-up', 'Add Visitor', 'Visited List'] },
    { name: 'Certificates', sub: ['Transfer Certificate', 'Character Certificate'] },
    { name: 'Forms', sub: ['Admission Query', 'Contact Us', 'NCC Query'] },
    { name: 'Student Documents', sub: ['View Documents', 'Verify Documents'] },
    { name: 'Reports', sub: [] },
    { name: 'Permissions', sub: [] },
    { name: 'Payroll', sub: ['Salary Settings', 'Generate Salary', 'Generate Payslip'] },
    { name: 'ID & Admit Cards', sub: ['Print ID Card', 'Generate Admit Card', 'Print Admit Card', 'Examination Center'] }
  ];

  const componentMap = {
    'Dashboard': Dashboard,
    'Add User': AddUser,
    'Manage Users': ManageUsers,
    'Session Management': SessionManagement,
    'Manage Fees': ManageFees,
    'Manage Concessions': ManageConcessions,
    'Transport Routes & Fare': TransportRoutesFare,
    'Hostel Fees': HostelFees,
    'Generate Discount': GenerateDiscount,
    'Add Subject': AddSubject,
    'Registration': Registration,
    'New Admission': NewAdmission,
    'Collect Fees': CollectFees,
    'Manage Receipts': ManageReceipts,
    'Duplicate Receipt': DuplicateReceipts,
    'Cancel Receipt': CancelReceipt,
    'Change Hostel/Transport': ChangeHostelTransport,
    'Fee Collection Summary': FeeCollectionSummary,
    'Fee Status Overview': FeeStatusOverview,
    'Notifications': ManageNotifications,
    'Circulars / Notice': Circulars,
    'Add Designation': AddDesignation,
    'Register Staff': RegisterStaff,
    'Staff Attendance': StaffAttendance,
    'Assign Class': AssignClass,
    'Leave Days': LeaveDays,
    'Add Work': AddWork,
    'Add Work Report': AddWorkReport,
    'Assign Work': AssignWork,
    'Staff Work Details': StaffWorkDetails,
    'Staff Work Updates': StaffWorkUpdates,
    'Expense Entry': ExpenseEntry,
    'Expense Reports': ExpenseReports,
    'Add Enquiry': AddEnquiry,
    'Enquiry Detail': EnquiryDetail,
    'Enquiry Follow-up': EnquiryFollowUp,
    'Add Visitor': AddVisitor,
    'Visited List': VisitedList,
    'Transfer Certificate': TransferCertificate,
    'Character Certificate': CharacterCertificate,
    'Admission Query': AdmissionQuery,
    'Contact Us': ContactUs,
    'NCC Query': NCCQuery,
    'View Documents': ViewDocuments,
    'Verify Documents': VerifyDocuments,
    'Reports': Reports,
    'Permissions': Permissions,
    'Salary Settings': SalarySettings,
    'Generate Salary': GenerateSalary,
    'Generate Payslip': GeneratePayslip,
    'Print ID Card': PrintIDCard,
    'Generate Admit Card': GenerateAdmitCard,
    'Print Admit Card': PrintAdmitCard,
    'Examination Center': ExaminationCenter
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
        <h2>Admin Panel</h2>
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

export default AdminPanel;
