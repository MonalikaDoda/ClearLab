import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AnalyticsChart({ invoices }) {
	// Aggregate invoices by status
	const statusData = [
		{
			name: 'Paid',
			count: invoices.filter((inv) => inv.status === 'paid').length,
			amount: invoices
				.filter((inv) => inv.status === 'paid')
				.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0),
		},
		{
			name: 'Partial',
			count: invoices.filter((inv) => inv.status === 'partial').length,
			amount: invoices
				.filter((inv) => inv.status === 'partial')
				.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0),
		},
		{
			name: 'Unpaid',
			count: invoices.filter((inv) => inv.status === 'unpaid').length,
			amount: invoices
				.filter((inv) => inv.status === 'unpaid')
				.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0),
		},
	];

	const COLORS = {
		paid: '#28765c',
		partial: '#946a20',
		unpaid: '#607077',
	};

	// Aggregate amount collected vs pending
	const collectionData = [
		{
			name: 'Collected',
			value: invoices.reduce((sum, inv) => sum + Number(inv.amountPaid || 0), 0),
		},
		{
			name: 'Pending',
			value: invoices.reduce((sum, inv) => sum + Math.max(Number(inv.totalAmount || 0) - Number(inv.amountPaid || 0), 0), 0),
		},
	];

	const COLLECTION_COLORS = ['#3d9c78', '#d5a136'];

	const formatCurrency = (value) => `₹${Number(value || 0).toFixed(0)}`;

	return (
		<section className="analytics-section">
			<div className="analytics-heading">
				<p className="eyebrow">Insights</p>
				<h2>Analytics overview</h2>
			</div>

			<div className="analytics-grid">
				{/* Invoices by Status */}
				<div className="analytics-card">
					<h3>Invoices by status</h3>
					<ResponsiveContainer width="100%" height={250}>
						<BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2eaec" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip formatter={(value) => value} />
							<Legend />
							<Bar dataKey="count" fill="#267d83" radius={[8, 8, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
					<div className="status-summary">
						{statusData.map((status) => (
							<div key={status.name} className="status-item">
								<span className="status-label">{status.name}:</span>
								<span className="status-count">{status.count}</span>
								<span className="status-amount">({formatCurrency(status.amount)})</span>
							</div>
						))}
					</div>
				</div>

				{/* Collection Overview */}
				<div className="analytics-card">
					<h3>Collection overview</h3>
					<ResponsiveContainer width="100%" height={250}>
						<PieChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
							<Pie
								data={collectionData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
								outerRadius={80}
								fill="#8884d8"
								dataKey="value"
							>
								{collectionData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLLECTION_COLORS[index]} />
								))}
							</Pie>
							<Tooltip formatter={(value) => formatCurrency(value)} />
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>
		</section>
	);
}

export default AnalyticsChart;
