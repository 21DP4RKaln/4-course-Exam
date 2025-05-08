'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Shield, FileSearch, Clock, User, Download, RefreshCw,
  AlertCircle, Info, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useLoading } from '@/app/hooks/useLoading'
import { format } from 'date-fns'

interface AuditLogEntry {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string | Date;
}

export default function AuditPage() {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const locale = pathname.split('/')[1]
 
  const API_ENDPOINT = '/api/admin/audit'

  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  
  const loadingComponent = useLoading(loading)

  // Fetch audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '25'); // Show 25 logs per page
        
        if (actionFilter !== 'all') {
          params.append('action', actionFilter);
        }
        
        if (entityFilter !== 'all') {
          params.append('entityType', entityFilter);
        }
        
        if (dateFilter !== 'all') {
          const now = new Date();
          let fromDate: Date;
          
          switch (dateFilter) {
            case 'today':
              fromDate = new Date(now.setHours(0, 0, 0, 0));
              break;
            case 'yesterday':
              fromDate = new Date(now);
              fromDate.setDate(fromDate.getDate() - 1);
              fromDate.setHours(0, 0, 0, 0);
              break;
            case 'week':
              fromDate = new Date(now);
              fromDate.setDate(fromDate.getDate() - 7);
              break;
            case 'month':
              fromDate = new Date(now);
              fromDate.setMonth(fromDate.getMonth() - 1);
              break;
            default:
              fromDate = new Date(0);
          }
          
          params.append('fromDate', fromDate.toISOString());
          params.append('toDate', new Date().toISOString());
        }
        
        const response = await fetch(`${API_ENDPOINT}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(data.pagination.pages);
        setTotalLogs(data.pagination.total);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        setError('Failed to load audit logs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, actionFilter, entityFilter, dateFilter]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'ADMIN') {
      router.push(`/${locale}/dashboard`)
    }
  }, [isAuthenticated, user, router, locale])

  // Filter logs based on user input
  const filteredLogs = logs.filter(log => {
    const matchesSearch = filter === '' || 
      (log.userName && log.userName.toLowerCase().includes(filter.toLowerCase())) ||
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.entityType.toLowerCase().includes(filter.toLowerCase()) ||
      (log.entityId && log.entityId.toLowerCase().includes(filter.toLowerCase())) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(filter.toLowerCase()));
      
    return matchesSearch;
  });

  // Get unique actions & entity types for filters
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  const uniqueEntityTypes = Array.from(new Set(logs.map(log => log.entityType)));

  // Export logs to CSV
  const exportToCSV = () => {
    window.location.href = `${API_ENDPOINT}?format=csv${
      actionFilter !== 'all' ? `&action=${actionFilter}` : ''
    }${
      entityFilter !== 'all' ? `&entityType=${entityFilter}` : ''
    }${
      dateFilter !== 'all' ? `&${getDateRangeParams(dateFilter)}` : ''
    }`;
  }
  
  // Helper function to get date range params for filter
  const getDateRangeParams = (filter: string) => {
    const now = new Date();
    let fromDate: Date;
    
    switch (filter) {
      case 'today':
        fromDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'yesterday':
        fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 1);
        fromDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 7);
        break;
      case 'month':
        fromDate = new Date(now);
        fromDate.setMonth(fromDate.getMonth() - 1);
        break;
      default:
        fromDate = new Date(0);
    }
    
    return `fromDate=${fromDate.toISOString()}&toDate=${new Date().toISOString()}`;
  }

  // Handle pagination
  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Helper function to get activity icon
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>;
      case 'update':
        return <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>;
      case 'delete':
        return <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>;
      case 'login':
        return <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>;
      case 'logout':
        return <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>;
      case 'view':
        return <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>;
      case 'publish':
        return <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>;
    }
  }

  // Format date for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  }

  // Refresh logs
  const refreshLogs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '25'); // Show 25 logs per page
      
      if (actionFilter !== 'all') {
        params.append('action', actionFilter);
      }
      
      if (entityFilter !== 'all') {
        params.append('entityType', entityFilter);
      }
      
      if (dateFilter !== 'all') {
        const now = new Date();
        let fromDate: Date;
        
        switch (dateFilter) {
          case 'today':
            fromDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'yesterday':
            fromDate = new Date(now);
            fromDate.setDate(fromDate.getDate() - 1);
            fromDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            fromDate = new Date(now);
            fromDate.setDate(fromDate.getDate() - 7);
            break;
          case 'month':
            fromDate = new Date(now);
            fromDate.setMonth(fromDate.getMonth() - 1);
            break;
          default:
            fromDate = new Date(0);
        }
        
        params.append('fromDate', fromDate.toISOString());
        params.append('toDate', new Date().toISOString());
      }
      
      const response = await fetch(`${API_ENDPOINT}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.pages);
      setTotalLogs(data.pagination.total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading && logs.length === 0) return loadingComponent

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <Shield className="mr-2" /> Audit Logs
        </h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={refreshLogs} 
            className="btn btn-outline flex items-center"
          >
            <RefreshCw size={16} className="mr-2" /> Refresh
          </button>
          <button 
            onClick={exportToCSV} 
            className="btn btn-outline flex items-center"
          >
            <Download size={16} className="mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                className="pl-10 form-input w-full"
                placeholder="Search logs..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
              <FileSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              Action
            </label>
            <select
              className="form-input"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              Entity Type
            </label>
            <select
              className="form-input"
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value)}
            >
              <option value="all">All Entities</option>
              {uniqueEntityTypes.map(entityType => (
                <option key={entityType} value={entityType}>
                  {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
              Date Range
            </label>
            <select
              className="form-input"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative mb-4">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {!loading && (
          <span>
            Showing {filteredLogs.length} logs (page {page} of {totalPages || 1})
            {totalLogs > 0 && ` • ${totalLogs} total logs`}
          </span>
        )}
      </div>

      {/* Logs table */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="inline-flex items-center">
                      <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin mr-2"></div>
                      <span>Loading audit logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {getActivityIcon(log.action)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${log.action === 'create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                          ${log.action === 'update' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                          ${log.action === 'delete' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                          ${log.action === 'login' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : ''}
                          ${log.action === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                          ${log.action === 'view' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : ''}
                          ${log.action === 'publish' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : ''}
                          ${log.action === 'approve' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' : ''}
                          ${'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}
                        `}>
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-gray-400" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <User size={14} className="mr-1 text-gray-400" />
                        {log.userName || 'System'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <span className="font-medium">{log.entityType}</span>
                        {log.entityId && (
                          <span className="ml-1 text-gray-400">#{log.entityId.substring(0, 8)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-sm truncate">
                      {log.details ? (
                        <span title={JSON.stringify(log.details)}>
                          {JSON.stringify(log.details).substring(0, 50)}
                          {JSON.stringify(log.details).length > 50 && '...'}
                        </span>
                      ) : (
                        <span className="text-gray-400">No details</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.ipAddress || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    No audit logs found matching the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing page {page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button 
              className="btn btn-outline px-3 py-1 text-sm flex items-center"
              disabled={page <= 1}
              onClick={goToPrevPage}
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </button>
            <button 
              className="btn btn-primary px-3 py-1 text-sm flex items-center"
              disabled={page >= totalPages}
              onClick={goToNextPage}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}