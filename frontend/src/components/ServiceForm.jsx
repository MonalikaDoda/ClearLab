import { useState } from 'react';
import { createService } from '../api/api';

function ServiceForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', price: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);
    try {
      await createService({ name: form.name, price: Number(form.price) });
      setForm({ name: '', price: '' });
      setMessage('Service added');
      await onCreated();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to add service.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="panel form-panel">
      <div className="panel-heading"><div><p className="eyebrow">Catalogue</p><h2>Add service</h2></div><span className="panel-index">02</span></div>
      <form onSubmit={handleSubmit}>
        <label>Service name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Complete blood count" /></label>
        <label>Price<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="0.00" /></label>
        <button className="button button-primary" disabled={isSaving}>{isSaving ? 'Adding...' : 'Add service'}</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </section>
  );
}

export default ServiceForm;
