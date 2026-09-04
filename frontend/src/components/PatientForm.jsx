import { useState } from 'react';
import { createPatient } from '../api/api';

function PatientForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', phone: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);
    try {
      await createPatient(form);
      setForm({ name: '', phone: '' });
      setMessage('Patient added');
      await onCreated();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to add patient.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="panel form-panel">
      <div className="panel-heading"><div><p className="eyebrow">Directory</p><h2>Add patient</h2></div><span className="panel-index">01</span></div>
      <form onSubmit={handleSubmit}>
        <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" /></label>
        <label>Phone<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone number" /></label>
        <button className="button button-primary" disabled={isSaving}>{isSaving ? 'Adding...' : 'Add patient'}</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </section>
  );
}

export default PatientForm;
