import { useState } from 'react';
import { recordPayment } from '../api/api';

const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

function InvoiceList({ invoices, onUpdated }) {
	const [paymentId, setPaymentId] = useState(null);
	const [amount, setAmount] = useState('');
	const [error, setError] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const submitPayment = async (invoice) => {
		setError('');
		setIsSaving(true);
		try {
			await recordPayment(invoice._id, Number(amount));
			setPaymentId(null);
			setAmount('');
			await onUpdated();
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Unable to record payment.');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<section className="panel table-panel">
			<div className="panel-heading"><div><p className="eyebrow">Ledger</p><h2>Invoices</h2></div><span className="count-label">{invoices.length} total</span></div>
			{error && <p className="error-message">{error}</p>}
			{invoices.length === 0 ? <p className="empty-state">No invoices have been created yet.</p> : <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Total</th><th>Paid</th><th>Status</th><th aria-label="Actions" /></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice._id}><td><strong>{invoice.patientId?.name || 'Unknown patient'}</strong><small>{invoice.patientId?.phone || '—'}</small></td><td className="money">{formatCurrency(invoice.totalAmount)}</td><td className="money">{formatCurrency(invoice.amountPaid)}</td><td><span className={`status-badge ${invoice.status}`}>{invoice.status}</span></td><td className="action-cell">{paymentId === invoice._id ? <div className="payment-editor"><input autoFocus min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" /><button className="button button-small" disabled={isSaving || !amount} onClick={() => submitPayment(invoice)}>{isSaving ? '...' : 'Save'}</button><button className="text-button" onClick={() => setPaymentId(null)}>Cancel</button></div> : <button className="text-button" onClick={() => { setPaymentId(invoice._id); setAmount(''); }}>Record payment</button>}</td></tr>)}</tbody></table></div>}
		</section>
	);
}

export default InvoiceList;
