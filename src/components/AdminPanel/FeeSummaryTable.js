import React from 'react';
import '../../styles/FeeSummaryTable.css';

const FeeSummaryTable = ({ fees }) => {
  const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paid, 0);
  const totalBalance = fees.reduce((sum, fee) => sum + fee.balance, 0);

  return (
    <div className="fee-summary-table">
      <h3>Fee Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Fee Head</th>
            <th>Total Amount</th>
            <th>Paid</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee, index) => (
            <tr key={index}>
              <td>{fee.head}</td>
              <td>₹{fee.amount.toLocaleString()}</td>
              <td>₹{fee.paid.toLocaleString()}</td>
              <td className={fee.balance > 0 ? 'balance-due' : 'paid'}>
                ₹{fee.balance.toLocaleString()}
              </td>
            </tr>
          ))}
          <tr className="total-row">
            <td><strong>Total</strong></td>
            <td><strong>₹{totalAmount.toLocaleString()}</strong></td>
            <td><strong>₹{totalPaid.toLocaleString()}</strong></td>
            <td className={totalBalance > 0 ? 'balance-due' : 'paid'}>
              <strong>₹{totalBalance.toLocaleString()}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FeeSummaryTable;
