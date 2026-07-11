import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Search, Trash2 } from 'lucide-react';
import { api } from '../services/api';

const ResourceListing = ({ userData }) => {
    const [resources, setResources] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        location: '',
        search: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const isAdmin = userData?.role === 'ADMIN';

    useEffect(() => {
        loadResources();
    }, [filters]);

    const loadResources = async () => {
        try {
            setLoading(true);
            setError('');
            const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
            const data = await api.getResources(cleanFilters);
            setResources(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const hasFilters = useMemo(() => Object.values(filters).some(Boolean), [filters]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await api.deleteResource(deleteTarget.id);
            setDeleteTarget(null);
            loadResources();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="card animate-fade">
                <div className="card-header">
                    <div>
                        <h2>Facilities & Assets Catalogue</h2>
                        <p>Modern admin view for campus spaces, labs, and operational equipment.</p>
                    </div>
                    {isAdmin && (
                        <Link to="/resources/new" className="btn btn-primary">
                            Add Resource
                        </Link>
                    )}
                </div>

                {error && <div className="badge badge-rejected" style={{ justifySelf: 'start', marginBottom: '1rem' }}>{error}</div>}

                <div className="resource-filters">
                    <label className="search-input">
                        <Search size={16} />
                        <input
                            name="search"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Search resources"
                        />
                    </label>
                    <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                        <option value="">All Types</option>
                        <option value="LECTURE_HALL">Lecture Hall</option>
                        <option value="LAB">Laboratory</option>
                        <option value="MEETING_ROOM">Meeting Room</option>
                        <option value="EQUIPMENT">Equipment</option>
                    </select>
                    <input
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        placeholder="Filter by location"
                    />
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                    </select>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading resources...</div>
                    ) : resources.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            {hasFilters ? 'No resources match the current filters.' : 'No resources found.'}
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Resource</th>
                                    <th>Type</th>
                                    <th>Location</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map((resource) => (
                                    <tr key={resource.id}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                                                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#eaf2ff', display: 'grid', placeItems: 'center', color: '#1e3a8a', fontWeight: 700 }}>
                                                    {resource.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <strong>{resource.name}</strong>
                                                    <p>{resource.description || 'No description provided.'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{resource.type.replaceAll('_', ' ')}</td>
                                        <td>{resource.location}</td>
                                        <td>{resource.capacity}</td>
                                        <td>
                                            <span className={`badge badge-${resource.status.toLowerCase()}`}>
                                                {resource.status.replaceAll('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Link to={`/resources/${resource.id}`} className="btn btn-secondary"><Eye size={16} /></Link>
                                                {isAdmin && (
                                                    <>
                                                        <Link to={`/resources/edit/${resource.id}`} className="btn btn-secondary"><Pencil size={16} /></Link>
                                                        <button onClick={() => setDeleteTarget(resource)} className="btn btn-danger-outline"><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {deleteTarget && (
                <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
                    <div className="modal-card" onClick={(event) => event.stopPropagation()}>
                        <div className="card-header">
                            <div>
                                <h3>Delete Resource</h3>
                                <p>This will permanently remove the resource if it is not referenced elsewhere.</p>
                            </div>
                        </div>
                        <div className="summary-block" style={{ marginBottom: '1rem' }}>
                            <span>Selected Resource</span>
                            <strong>{deleteTarget.name}</strong>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-danger-outline" onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResourceListing;
