import { useState } from 'react';
import { createInvoice } from '../api/api';

const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

function InvoiceForm({ patients, services, onCreated }) {
	const [patientId, setPatientId] = useState('');
	const [selectedServices, setSelectedServices] = useState([]);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const total = services.filter((service) => selectedServices.includes(service._id)).reduce((sum, service) => sum + Number(service.price), 0);
	const toggleService = (serviceId) => setSelectedServices((current) => current.includes(serviceId) ? current.filter((id) => id !== serviceId) : [...current, serviceId]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setMessage('');
		setIsSaving(true);
		try {
			await createInvoice({ patientId, serviceIds: selectedServices });
			setPatientId('');
			setSelectedServices([]);
			setMessage('Invoice created');
			await onCreated();
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Unable to create invoice.');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<section className="panel invoice-form-panel">
			<div className="panel-heading"><div><p className="eyebrow">Billing</p><h2>Create invoice</h2></div><span className="panel-index">03</span></div>
			<form onSubmit={handleSubmit}>
				<label>Patient<select required value={patientId} onChange={(event) => setPatientId(event.target.value)}><option value="">Select a patient</option>{patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.name} · {patient.phone}</option>)}</select></label>
				<fieldset><legend>Services</legend><div className="service-checklist">{services.length === 0 ? <p className="muted">Add a service to begin.</p> : services.map((service) => <label className="service-option" key={service._id}><input type="checkbox" checked={selectedServices.includes(service._id)} onChange={() => toggleService(service._id)} /><span>{service.name}</span><strong>{formatCurrency(service.price)}</strong></label>)}</div></fieldset>
				<div className="invoice-total"><span>Invoice total</span><strong>{formatCurrency(total)}</strong></div>
				<button className="button button-primary" disabled={isSaving || !patientId || selectedServices.length === 0}>{isSaving ? 'Creating...' : 'Create invoice'}</button>
			</form>
			{message && <p className="success-message">{message}</p>}
			{error && <p className="error-message">{error}</p>}
		</section>
	);
}

export default InvoiceForm;
