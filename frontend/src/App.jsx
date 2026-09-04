import { useCallback, useEffect, useState } from 'react';
import { getFlaggedInvoices, getInvoices, getPatients, getServices } from './api/api';
import PatientForm from './components/PatientForm';
import ServiceForm from './components/ServiceForm';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';
import FlaggedReviewPanel from './components/FlaggedReviewPanel';
import './App.css';

function App() {
	const [patients, setPatients] = useState([]);
	const [services, setServices] = useState([]);
	const [invoices, setInvoices] = useState([]);
	const [flaggedInvoices, setFlaggedInvoices] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	const refreshData = useCallback(async () => {
		try {
			const [patientData, serviceData, invoiceData, flaggedData] = await Promise.all([getPatients(), getServices(), getInvoices(), getFlaggedInvoices()]);
			setPatients(patientData);
			setServices(serviceData);
			setInvoices(invoiceData);
			setFlaggedInvoices(flaggedData);
			setError('');
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Unable to connect to the ClearLab API.');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => { refreshData(); }, [refreshData]);
	const handleRefresh = async () => { await refreshData(); };

	return (
		<main className="app-shell">
			<header className="app-header"><div className="brand-lockup"><span className="brand-mark">CL</span><div><h1>ClearLab</h1><p>Diagnostic billing desk</p></div></div><div className="header-meta"><span className="live-dot" /> Live workspace</div></header>
			<div className="content-wrap">
				<section className="intro-row"><div><p className="eyebrow">Operations / {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p><h2>Billing overview</h2><p className="intro-copy">Keep patient accounts, services, and follow-ups in one clear view.</p></div><button className="text-button refresh-button" onClick={handleRefresh}>Refresh data ↻</button></section>
				{error && <div className="global-error">{error} <button className="text-button" onClick={refreshData}>Try again</button></div>}
				{isLoading ? <div className="loading-state">Loading billing records...</div> : <><div className="top-grid"><PatientForm onCreated={handleRefresh} /><ServiceForm onCreated={handleRefresh} /></div><InvoiceForm patients={patients} services={services} onCreated={handleRefresh} /><InvoiceList invoices={invoices} onUpdated={refreshData} /><FlaggedReviewPanel invoices={flaggedInvoices} onUpdated={refreshData} /></>}
			</div>
		</main>
	);
}

export default App;
