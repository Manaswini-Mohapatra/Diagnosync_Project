import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
        <p className="font-semibold text-gray-700">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsCharts = ({ charts }) => {
  if (!charts) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* User Growth Analytics */}
      <div className="glass-panel p-5 rounded-2xl shadow-soft border-none">
        <h3 className="text-lg font-bold text-gray-800 mb-4">User Growth Trends</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="patients" name="Patients" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="doctors" name="Doctors" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Symptom Analysis Analytics */}
      <div className="glass-panel p-5 rounded-2xl shadow-soft border-none">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Symptom Analyses Over Time</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.symptomTrends}>
              <defs>
                <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="analyses" name="Analyses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAnalyses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Appointment Analytics */}
      <div className="glass-panel p-5 rounded-2xl shadow-soft border-none">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Appointment Status</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.appointmentStatus}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Appointments" radius={[4, 4, 0, 0]}>
                {charts.appointmentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Doctor to Patient Ratio & Specializations */}
      <div className="glass-panel p-5 rounded-2xl shadow-soft border-none flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">User Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.doctorToPatientRatio} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {charts.doctorToPatientRatio.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Top Specializations</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.specializations} outerRadius={80} dataKey="value">
                  {charts.specializations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most Consulted Doctors */}
      <div className="glass-panel p-5 rounded-2xl shadow-soft border-none lg:col-span-2">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Most Consulted Doctors</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.topDoctors} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="consultations" name="Consultations" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Performance */}
      <div className="glass-panel p-5 rounded-2xl shadow-soft border-none lg:col-span-2">
        <h3 className="text-lg font-bold text-gray-800 mb-4">API Performance (Response Time & Errors)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.systemPerformance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis yAxisId="left" tick={{fontSize: 12}} />
              <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="responseTime" name="Avg Response Time (ms)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="step" dataKey="errors" name="API Errors" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsCharts;
