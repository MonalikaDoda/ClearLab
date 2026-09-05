const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

function StatsStrip({ invoices }) {
	const totalInvoices = invoices.length;
	const totalCollected = invoices.reduce((sum, invoice) => sum + Number(invoice.amountPaid || 0), 0);
	const totalPending = invoices.reduce((sum, invoice) => sum + Math.max(Number(invoice.totalAmount || 0) - Number(invoice.amountPaid || 0), 0), 0);

	return (
		<section className="stats-strip">
			<div className="stat-item">
				<span className="stat-label">Total invoices</span>
				<strong className="stat-value">{totalInvoices}</strong>
			</div>
			<div className="stat-item">
				<span className="stat-label">Amount collected</span>
				<strong className="stat-value">{formatCurrency(totalCollected)}</strong>
			</div>
			<div className="stat-item">
				<span className="stat-label">Amount pending</span>
				<strong className="stat-value">{formatCurrency(totalPending)}</strong>
			</div>
		</section>
	);
}

export default StatsStrip;
