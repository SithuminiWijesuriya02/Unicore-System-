import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, MapPin, ShieldAlert, Wrench, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import TicketAnalytics from './TicketAnalytics';

const TicketList = ({ userData }) => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const isPrivileged = ['ADMIN', 'TECHNICIAN'].includes(userData?.role);

    useEffect(() => {
        loadTickets();
    }, [userData?.role]);

    useEffect(() => {
        let result = tickets;
        
        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase();
            result = result.filter(t => 
                t.description?.toLowerCase().includes(lowerQuery) || 
                t.id.toString().includes(lowerQuery) ||
                t.location?.toLowerCase().includes(lowerQuery)
            );
        }
        
        if (statusFilter) {
            result = result.filter(t => t.status === statusFilter);
        }
        
        if (categoryFilter) {
            result = result.filter(t => t.category === categoryFilter);
        }
        
        setFilteredTickets(result);
    }, [searchTerm, statusFilter, categoryFilter, tickets]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await api.getTickets(isPrivileged);
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTickets(sorted);
            setFilteredTickets(sorted);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'OPEN': return 'status-open';
            case 'IN_PROGRESS': return 'status-progress';
            case 'REJECTED': return 'status-rejected';
            case 'RESOLVED': case 'CLOSED': return 'status-resolved';
            default: return 'status-open';
        }
    };

    // Extract unique categories for filter
    const uniqueCategories = [...new Set(tickets.map(t => t.category))].filter(Boolean);

    return (
        <div className="grid gap-6 animate-fade">
            {isPrivileged && <TicketAnalytics />}

            <div className="card">
                <div className="card-header flex-wrap">
                    <div>
                        <h2>Ticket Operations</h2>
                        <p>{isPrivileged ? 'Manage and track maintenance requests.' : 'Create and follow your maintenance requests.'}</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-secondary" onClick={loadTickets}>Refresh</button>
                        {userData?.role === 'USER' && (
                            <Link to="/tickets/new" className="btn btn-primary">Create Ticket</Link>
                        )}
                    </div>
                </div>

                {error && <div className="badge badge-rejected" style={{ justifySelf: 'start', marginBottom: '1rem' }}>{error}</div>}

                <div className="flex gap-4 mb-6 flex-wrap">
                    <div className="search-input" style={{ flex: '1 1 250px' }}>
                        <Search size={16} color="#6b7280" />
                        <input 
                            type="text" 
                            placeholder="Search description, ID, location..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="bg-white" style={{ flex: '0 1 180px', borderRadius: '16px', border: '1px solid var(--border)', padding: '0.82rem' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <select 
                        className="bg-white" style={{ flex: '0 1 180px', borderRadius: '16px', border: '1px solid var(--border)', padding: '0.82rem' }}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center p-6 text-muted">Loading tickets...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center p-6 text-muted">No tickets found matching your criteria.</div>
                ) : (
                    <div className="ticket-grid">
                        {filteredTickets.map((ticket) => (
                            <article key={ticket.id} className="ticket-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div className="ticket-card-head">
                                    <div>
                                        <span className={`ticket-status ${getStatusClass(ticket.status)}`}>{ticket.status.replaceAll('_', ' ')}</span>
                                        <h3>Ticket #{ticket.id}</h3>
                                    </div>
                                    <span className="ticket-priority">{ticket.priority}</span>
                                </div>

                                <div className="ticket-meta">
                                    <span><Wrench size={14} /> {ticket.category.replaceAll('_', ' ')}</span>
                                    <span><MapPin size={14} /> {ticket.location}</span>
                                    <span><CalendarClock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>

                                <p className="ticket-description" style={{ flexGrow: 1 }}>{ticket.description.substring(0, 100)}{ticket.description.length > 100 ? '...' : ''}</p>

                                <div className="ticket-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <div className="ticket-owner">
                                        <ShieldAlert size={14} />
                                        <span style={{ fontSize: '0.8rem' }}>{isPrivileged ? `By: ${ticket.reportedByName}` : `Assigned: ${ticket.assignedToName || 'Unassigned'}`}</span>
                                    </div>
                                    <Link to={`/tickets/${ticket.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>View Details</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketList;
