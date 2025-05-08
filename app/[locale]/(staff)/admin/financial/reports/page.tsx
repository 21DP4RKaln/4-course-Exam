'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import { useTheme } from '@/app/contexts/ThemeContext'
import {
  FileText, Download, Calendar, Filter, ArrowLeft,
  BarChart2, TrendingUp, DollarSign, Search
} from 'lucide-react'

type ReportType = 'sales' | 'revenue' | 'profit' | 'tax'
type TimeFrame = 'monthly' | 'quarterly' | 'yearly'

type Report = {
  id: string
  type: ReportType
  timeFrame: TimeFrame
  period: string
  generatedAt: string
  fileUrl: string
  fileSize: string
  status: 'ready' | 'generating' | 'failed'
}

export default function AdminFinancialReportsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const { user } = useAuth()
  const { theme } = useTheme()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [reportType, setReportType] = useState<ReportType>('sales')
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly')
  const [period, setPeriod] = useState('')

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push(`/${locale}/dashboard`)
      return
    }
    fetchReports()
  }, [user])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/financial/reports')
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    if (!period) {
      alert('Please select a period')
      return
    }

    try {
      setGenerating(true)
      const response = await fetch('/api/admin/financial/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: reportType,
          timeFrame,
          period
        }),
      })

      if (response.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = (fileUrl: string) => {
    window.open(fileUrl, '_blank')
  }

  const getReportIcon = (type: ReportType) => {
    switch (type) {
      case 'sales':
        return <BarChart2 className="w-5 h-5" />
      case 'revenue':
        return <TrendingUp className="w-5 h-5" />
      case 'profit':
        return <DollarSign className="w-5 h-5" />
      case 'tax':
        return <FileText className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={`/${locale}/admin/financial`}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Reports
          </h1>
        </div>
      </div>

      {/* Report Generator */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Generate New Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="sales">Sales Report</option>
              <option value="revenue">Revenue Report</option>
              <option value="profit">Profit Report</option>
              <option value="tax">Tax Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Frame
            </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Period
            </label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={generating}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Generated Reports
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Time Frame
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No reports generated yet
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getReportIcon(report.type)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {report.timeFrame.charAt(0).toUpperCase() + report.timeFrame.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {report.period}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {report.fileSize}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        report.status === 'generating' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {report.status === 'ready' && (
                        <button
                          onClick={() => downloadReport(report.fileUrl)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}