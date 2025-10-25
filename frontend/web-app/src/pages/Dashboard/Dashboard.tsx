import React from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const stats = [
    { name: 'Total Patients', value: '1,234', icon: UsersIcon, change: '+12%', changeType: 'positive' },
    { name: 'Appointments Today', value: '24', icon: CalendarIcon, change: '+8%', changeType: 'positive' },
    { name: 'Monthly Revenue', value: '$45,678', icon: CurrencyDollarIcon, change: '+15%', changeType: 'positive' },
    { name: 'Messages', value: '89', icon: ChatBubbleLeftRightIcon, change: '+3%', changeType: 'positive' },
  ];

  const recentActivities = [
    { id: 1, type: 'appointment', patient: 'John Doe', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'message', patient: 'Jane Smith', time: '4 hours ago', status: 'unread' },
    { id: 3, type: 'appointment', patient: 'Bob Johnson', time: '6 hours ago', status: 'scheduled' },
    { id: 4, type: 'payment', patient: 'Alice Brown', time: '1 day ago', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your practice today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart Placeholder */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Revenue Overview</h3>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-400' : 
                  activity.status === 'unread' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.patient}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {activity.type} • {activity.time}
                  </p>
                </div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                  activity.status === 'unread' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all activities →
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button className="btn-primary text-center">
            New Patient
          </button>
          <button className="btn-secondary text-center">
            Schedule Appointment
          </button>
          <button className="btn-secondary text-center">
            Send Message
          </button>
          <button className="btn-secondary text-center">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;