import { useState } from 'react';
import { generateReminder } from '../api/api';

const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

function FlaggedReviewPanel({ invoices, onUpdated }) {
	const [loadingId, setLoadingId] = useState(null);
	const [reminders, setReminders] = useState({});
	const [errors, setErrors] = useState({});

	const handleReminder = async (invoice) => {
		setLoadingId(invoice._id);
		setErrors((current) => ({ ...current, [invoice._id]: '' }));
		try {
			const result = await generateReminder(invoice._id);
			setReminders((current) => ({ ...current, [invoice._id]: result.message }));
			await onUpdated();
		} catch (requestError) {
			setErrors((current) => ({ ...current, [invoice._id]: requestError.response?.data?.message || 'Unable to generate reminder.' }));
		} finally {
			setLoadingId(null);
		}
	};

	return (
		<section className="panel review-panel">
			<div className="panel-heading"><div><p className="eyebrow">Follow-up queue</p><h2>Flagged for review</h2></div><span className="count-label">{invoices.length} need attention</span></div>
			{invoices.length === 0 ? <p className="empty-state">No invoices are currently flagged for review.</p> : <div className="review-list">{invoices.map((invoice) => <article className="review-item" key={invoice._id}><div className="review-summary"><div><strong>{invoice.patientId?.name || 'Unknown patient'}</strong><p>{formatCurrency(Number(invoice.totalAmount) - Number(invoice.amountPaid))} pending</p></div><button className="button button-secondary" disabled={loadingId === invoice._id} onClick={() => handleReminder(invoice)}>{loadingId === invoice._id ? 'Generating...' : 'Generate reminder'}</button></div>{errors[invoice._id] && <p className="warning-message">{errors[invoice._id]}</p>}{reminders[invoice._id] && <div className="reminder-card"><p>{reminders[invoice._id]}</p><span>AI-generated draft</span></div>}</article>)}</div>}
		</section>
	);
}

export default FlaggedReviewPanel;
