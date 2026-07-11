import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const TicketForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [resources, setResources] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [formData, setFormData] = useState({
        resourceId: '',
        location: '',
        category: 'FACILITY_MAINTENANCE',
        priority: 'LOW',
        description: '',
        contactDetails: '',
    });

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const data = await api.getResources();
                setResources(data.filter((resource) => resource.status === 'ACTIVE'));
            } catch (err) {
                setError(err.message);
            }
        };

        fetchResources();
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const selectedResource = useMemo(
        () => resources.find((resource) => resource.id === Number(formData.resourceId)),
        [resources, formData.resourceId]
    );

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Only PNG, JPG, and WEBP files are allowed.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError('Attachment must be 5MB or smaller.');
            return;
        }
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setError('');
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearAttachment = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setImageFile(null);
        setPreviewUrl('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setFieldErrors({});

        try {
            const payload = { ...formData };
            if (!payload.resourceId) {
                delete payload.resourceId;
            } else {
                payload.resourceId = Number(payload.resourceId);
            }

            const newTicket = await api.createTicket(payload);
            if (imageFile && newTicket.id) {
                await api.uploadTicketImage(newTicket.id, imageFile);
            }

            navigate(`/tickets/${newTicket.id}`);
        } catch (err) {
            setError(err.message);
            if (err.fieldErrors) {
                setFieldErrors(err.fieldErrors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade" style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div className="card-header">
                <div>
                    <h2>Create Ticket</h2>
                    <p>Report a campus issue with clear categorization, required validation, and optional evidence upload.</p>
                </div>
            </div>

            {error && (
                <div className="badge badge-rejected" style={{ justifySelf: 'start', marginBottom: '1rem', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', height: 'auto', borderRadius: '12px' }}>
                    <div className="font-bold flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                    {/* Display specific field errors if available */}
                    {Object.keys(fieldErrors || {}).length > 0 && (
                        <ul style={{ margin: '0.25rem 0 0 1.5rem', padding: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                            {Object.entries(fieldErrors).map(([field, msg]) => (
                                <li key={field}>{msg}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid grid-cols-2">
                    <div className="form-group">
                        <label>Category</label>
                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                            <option value="FACILITY_MAINTENANCE">Facility Maintenance</option>
                            <option value="IT_SUPPORT">IT Support</option>
                            <option value="CLEANING">Cleaning</option>
                            <option value="EQUIPMENT_REPAIR">Equipment Repair</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Priority</label>
                        <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Related Resource</label>
                    <select value={formData.resourceId} onChange={(e) => setFormData({ ...formData, resourceId: e.target.value, location: selectedResource?.location || formData.location })}>
                        <option value="">General campus issue</option>
                        {resources.map((resource) => (
                            <option key={resource.id} value={resource.id}>{resource.name} ({resource.location})</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Location</label>
                    <input 
                        value={formData.location} 
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                        required 
                        maxLength={120}
                        placeholder="e.g. Building B, Level 3, Room 302"
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        rows="5" 
                        value={formData.description} 
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                        required 
                        minLength={10}
                        placeholder="Please describe the issue in at least 10 characters..."
                    />
                </div>

                <div className="grid grid-cols-2">
                    <div className="form-group">
                        <label>Attachment</label>
                        <label className="upload-box">
                            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
                            <span><ImagePlus size={18} /> Upload image evidence</span>
                        </label>
                        {previewUrl && (
                            <div className="attachment-preview">
                                <img src={previewUrl} alt="Attachment preview" />
                                <button type="button" className="attachment-remove" onClick={clearAttachment}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Contact Details (Optional)</label>
                        <input 
                            value={formData.contactDetails} 
                            onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })} 
                            placeholder="Phone extension or alternate email" 
                            maxLength={120}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/tickets')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TicketForm;
