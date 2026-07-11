import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

const validate = (formData) => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.type) errors.type = 'Type is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.capacity || Number(formData.capacity) <= 0) errors.capacity = 'Capacity must be greater than 0';
    return errors;
};

const ResourceForm = ({ userData }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [touched, setTouched] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        type: 'LECTURE_HALL',
        capacity: '',
        location: '',
        status: 'ACTIVE',
        description: '',
    });

    useEffect(() => {
        if (userData?.role !== 'ADMIN') {
            navigate('/resources');
        }
    }, [userData, navigate]);

    useEffect(() => {
        if (!isEditing) return;

        const fetchResource = async () => {
            try {
                setLoading(true);
                const data = await api.getResourceById(id);
                setFormData({
                    name: data.name,
                    type: data.type,
                    capacity: String(data.capacity || ''),
                    location: data.location,
                    status: data.status,
                    description: data.description || '',
                });
            } catch (err) {
                setError(`Failed to load resource: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchResource();
    }, [id, isEditing]);

    const errors = useMemo(() => validate(formData), [formData]);
    const isValid = Object.keys(errors).length === 0;

    const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setTouched({ name: true, type: true, capacity: true, location: true });
        if (!isValid) return;

        setSubmitting(true);
        setError('');

        try {
            let resourceId = id;
            const payload = {
                ...formData,
                capacity: Number(formData.capacity),
            };

            if (isEditing) {
                await api.updateResource(id, payload);
            } else {
                const created = await api.createResource(payload);
                resourceId = created.id;
            }

            if (imageFile && resourceId) {
                await api.uploadResourceImage(resourceId, imageFile);
            }

            navigate('/resources');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const fieldClass = (field) => touched[field] && errors[field] ? 'input-invalid' : '';

    if (loading) return <div className="card">Loading resource...</div>;

    return (
        <div className="card animate-fade" style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div className="card-header">
                <div>
                    <h2>{isEditing ? 'Edit Resource' : 'Add Resource'}</h2>
                    <p>Create and maintain university facilities and assets with validated admin controls.</p>
                </div>
            </div>

            {error && <div className="badge badge-rejected" style={{ justifySelf: 'start', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="form-group">
                    <label>Resource Name</label>
                    <input
                        className={fieldClass('name')}
                        value={formData.name}
                        onBlur={() => markTouched('name')}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="grid grid-cols-2">
                    <div className="form-group">
                        <label>Type</label>
                        <select
                            className={fieldClass('type')}
                            value={formData.type}
                            onBlur={() => markTouched('type')}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="LECTURE_HALL">Lecture Hall</option>
                            <option value="LAB">Laboratory</option>
                            <option value="MEETING_ROOM">Meeting Room</option>
                            <option value="EQUIPMENT">Equipment</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Capacity</label>
                        <input
                            type="number"
                            min="1"
                            className={fieldClass('capacity')}
                            value={formData.capacity}
                            onBlur={() => markTouched('capacity')}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        />
                        {touched.capacity && errors.capacity && <span className="field-error">{errors.capacity}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2">
                    <div className="form-group">
                        <label>Location</label>
                        <input
                            className={fieldClass('location')}
                            value={formData.location}
                            onBlur={() => markTouched('location')}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                        {touched.location && errors.location && <span className="field-error">{errors.location}</span>}
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                            <option value="ACTIVE">Active</option>
                            <option value="OUT_OF_SERVICE">Out of Service</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>Resource Image</label>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </div>

                <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={submitting || !isValid}>
                        {submitting ? 'Saving...' : isEditing ? 'Update Resource' : 'Create Resource'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/resources')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResourceForm;
