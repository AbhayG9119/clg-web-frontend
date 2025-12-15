import React, { useState, useEffect, useMemo } from 'react';
import { feesApi } from '../../services/adminApi';

const FeesLedgerSection = ({ feeLedger = [], filters: propFilters, setFilters: propSetFilters }) => {
  const [localFilters, setLocalFilters] = useState({ feeType: '', dateRange: { start: '', end: '' } });
  const [classFilter, setClassFilter] = useState(''); // Optional for multi-class
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = propFilters || localFilters;
  const setFilters = propSetFilters || setLocalFilters;

  // Fetch payments data on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await feesApi.getMyPayments();
      if (result.success) {
        setPayments(result.data);
      } else {
        setError(result.error || 'Failed to fetch payments');
      }
    } catch (err) {
      setError('Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Transform backend data to component format
  const transformedLedger = useMemo(() => {
    return payments.map(payment => ({
      transaction_id: payment.paymentId,
      date: payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : new Date(payment.createdAt).toLocaleDateString(),
      fee_type: payment.paymentType === 'semester' ? 'Semester Fee' : payment.paymentType === 'year' ? 'Annual Fee' : payment.paymentType,
      amount: payment.amount,
      payment_mode: payment.paymentMethod || 'Online',
      status: payment.status
    }));
  }, [payments]);

  // Use transformed data or prop data
  const ledgerData = propFilters ? feeLedger : transformedLedger;

  // Filtered and sorted ledger (recent first)
  const filteredLedger = useMemo(() => {
    if (!ledgerData || !Array.isArray(ledgerData) || !filters) return [];
    let filtered = ledgerData.filter(fee => {
      const matchesFeeType = !filters.feeType || fee.fee_type.toLowerCase().includes(filters.feeType.toLowerCase());
      const matchesDate = (!filters.dateRange.start || new Date(fee.date) >= new Date(filters.dateRange.start)) &&
                          (!filters.dateRange.end || new Date(fee.date) <= new Date(filters.dateRange.end));
      return matchesFeeType && matchesDate;
    });
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [ledgerData, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (typeof setFilters === 'function') {
      if (name === 'feeType') {
        setFilters(prev => ({ ...prev, feeType: value }));
      } else if (name === 'startDate') {
        setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: value } }));
      } else if (name === 'endDate') {
        setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: value } }));
      }
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      Paid: 'badge paid',
      Pending: 'badge pending',
      Failed: 'badge overdue'
    };
    return <span className={classes[status] || 'badge'}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="fees-ledger-section">
        <h2>View Fees Ledger</h2>
        <div className="loading">Loading payment history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fees-ledger-section">
        <h2>View Fees Ledger</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="fees-ledger-section">
      <h2>View Fees Ledger</h2>

      {/* Filters */}
      <div className="filter-bar">
        <select name="feeType" value={filters.feeType} onChange={handleFilterChange}>
          <option value="">All Fee Types</option>
          <option value="semester">Semester Fee</option>
          <option value="annual">Annual Fee</option>
        </select>
        <input
          type="date"
          name="startDate"
          placeholder="Start Date"
          value={filters.dateRange.start}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="endDate"
          placeholder="End Date"
          value={filters.dateRange.end}
          onChange={handleFilterChange}
        />
        {/* Optional Class Dropdown */}
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All Classes</option>
          <option value="Class A">Class A</option>
          <option value="Class B">Class B</option>
        </select>
      </div>

      {/* Ledger Table */}
      {filteredLedger.length > 0 ? (
        <table className="fees-table" role="table" aria-label="Fees Ledger">
          <thead>
            <tr>
              <th>Transaction Date</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Payment Mode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedger.map(fee => (
              <tr key={fee.transaction_id} title={`Receipt ID: ${fee.transaction_id}`}>
                <td>{fee.date}</td>
                <td>{fee.fee_type}</td>
                <td>₹{fee.amount}</td>
                <td>{fee.payment_mode}</td>
                <td>{getStatusBadge(fee.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <p>No fee records found</p>
        </div>
      )}
    </div>
  );
};

export default FeesLedgerSection;
