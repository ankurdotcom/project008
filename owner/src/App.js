import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  FaSync,
  FaCloudUploadAlt,
  FaCloudDownloadAlt,
  FaFileExport,
  FaCog,
  FaDesktop,
  FaDollarSign,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaShieldAlt
} from 'react-icons/fa';
import './App.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Google Drive Manager
class GoogleDriveManager {
  constructor() {
    this.isAuthenticated = false;
    this.tokenClient = null;
    this.gapi = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('client', async () => {
          await window.gapi.client.init({
            apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          this.gapi = window.gapi;
          resolve();
        });
      } else {
        reject(new Error('Google API not loaded'));
      }
    });
  }

  async authenticate() {
    if (!this.tokenClient) {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse) => {
          if (tokenResponse.access_token) {
            this.isAuthenticated = true;
            localStorage.setItem('google_token', tokenResponse.access_token);
          }
        },
      });
    }

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (tokenResponse) => {
        if (tokenResponse.error) {
          reject(tokenResponse);
        } else {
          this.isAuthenticated = true;
          localStorage.setItem('google_token', tokenResponse.access_token);
          resolve(tokenResponse);
        }
      };
      this.tokenClient.requestAccessToken();
    });
  }

  async uploadBackup(data, filename) {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    const fileMetadata = {
      name: filename,
      parents: [await this.getOrCreateBackupFolder()],
    };

    const media = {
      mimeType: 'application/json',
      body: JSON.stringify(data),
    };

    const response = await this.gapi.client.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    return response.result.id;
  }

  async getOrCreateBackupFolder() {
    const query = "name='GroceryPOS_Backups' and mimeType='application/vnd.google-apps.folder'";
    const response = await this.gapi.client.drive.files.list({
      q: query,
      fields: 'files(id, name)',
    });

    if (response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    const folderMetadata = {
      name: 'GroceryPOS_Backups',
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folderResponse = await this.gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id',
    });

    return folderResponse.result.id;
  }
}

// Components
function SalesChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [{
      label: 'Sales ($)',
      data: data.values,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Sales Trend' },
    },
  };

  return <Line data={chartData} options={options} />;
}

function TerminalStatus({ terminals }) {
  return (
    <div className="terminal-grid">
      {terminals.map(terminal => (
        <div key={terminal.id} className={`terminal-card ${terminal.status}`}>
          <div className="terminal-header">
            <FaDesktop />
            <span>{terminal.name}</span>
          </div>
          <div className="terminal-stats">
            <div className="stat">
              <span className="label">Sales Today:</span>
              <span className="value">${terminal.todaySales.toFixed(2)}</span>
            </div>
            <div className="stat">
              <span className="label">Transactions:</span>
              <span className="value">{terminal.transactions}</span>
            </div>
            <div className="stat">
              <span className="label">Last Sync:</span>
              <span className="value">{terminal.lastSync}</span>
            </div>
          </div>
          <div className="terminal-status">
            <span className={`status-indicator ${terminal.status}`}></span>
            {terminal.status.toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
}

function DataExport({ onExport }) {
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('today');

  const handleExport = () => {
    onExport(format, dateRange);
  };

  return (
    <div className="export-panel">
      <h3><FaFileExport /> Export Data</h3>
      <div className="export-controls">
        <div className="control-group">
          <label>Format:</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
            <option value="xlsx">Excel</option>
          </select>
        </div>
        <div className="control-group">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <button onClick={handleExport} className="export-btn">
          <FaFileExport /> Export
        </button>
      </div>
    </div>
  );
}

function BackupManager({ onBackup, onRestore }) {
  const [backupStatus, setBackupStatus] = useState('idle');
  const [lastBackup, setLastBackup] = useState(localStorage.getItem('lastBackup') || 'Never');

  const handleBackup = async () => {
    setBackupStatus('backing-up');
    try {
      await onBackup();
      setBackupStatus('success');
      const now = new Date().toLocaleString();
      setLastBackup(now);
      localStorage.setItem('lastBackup', now);
    } catch (error) {
      setBackupStatus('error');
      console.error('Backup failed:', error);
    }
  };

  return (
    <div className="backup-panel">
      <h3><FaCloudUploadAlt /> Backup & Recovery</h3>
      <div className="backup-info">
        <div className="info-item">
          <span className="label">Last Backup:</span>
          <span className="value">{lastBackup}</span>
        </div>
        <div className="info-item">
          <span className="label">Status:</span>
          <span className={`value status-${backupStatus}`}>
            {backupStatus === 'idle' && 'Ready'}
            {backupStatus === 'backing-up' && 'Backing up...'}
            {backupStatus === 'success' && 'Success'}
            {backupStatus === 'error' && 'Error'}
          </span>
        </div>
      </div>
      <div className="backup-actions">
        <button onClick={handleBackup} disabled={backupStatus === 'backing-up'} className="backup-btn">
          <FaCloudUploadAlt /> Backup to Google Drive
        </button>
        <button onClick={onRestore} className="restore-btn">
          <FaCloudDownloadAlt /> Restore from Google Drive
        </button>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onSettingsChange }) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="settings-panel">
      <h3><FaCog /> Settings</h3>
      <div className="settings-group">
        <h4><FaSync /> Sync Settings</h4>
        <div className="setting-item">
          <label>Auto Sync Interval (minutes):</label>
          <input
            type="number"
            value={localSettings.autoSyncInterval}
            onChange={(e) => handleChange('autoSyncInterval', parseInt(e.target.value))}
            min="1"
            max="60"
          />
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localSettings.enableAutoBackup}
              onChange={(e) => handleChange('enableAutoBackup', e.target.checked)}
            />
            Enable Auto Backup
          </label>
        </div>
      </div>

      <div className="settings-group">
        <h4><FaShieldAlt /> Security Settings</h4>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localSettings.enableEncryption}
              onChange={(e) => handleChange('enableEncryption', e.target.checked)}
            />
            Enable Data Encryption
          </label>
        </div>
        <div className="setting-item">
          <label>Session Timeout (hours):</label>
          <input
            type="number"
            value={localSettings.sessionTimeout}
            onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
            min="1"
            max="24"
          />
        </div>
      </div>

      <div className="settings-group">
        <h4><FaChartLine /> Analytics Settings</h4>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localSettings.enableRealTimeUpdates}
              onChange={(e) => handleChange('enableRealTimeUpdates', e.target.checked)}
            />
            Enable Real-time Updates
          </label>
        </div>
        <div className="setting-item">
          <label>Chart Refresh Rate (seconds):</label>
          <input
            type="number"
            value={localSettings.chartRefreshRate}
            onChange={(e) => handleChange('chartRefreshRate', parseInt(e.target.value))}
            min="5"
            max="300"
          />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const dispatch = useDispatch();
  const sales = useSelector(state => state.sales);
  const [googleDrive, setGoogleDrive] = useState(null);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState({
    autoSyncInterval: 5,
    enableAutoBackup: true,
    enableEncryption: true,
    sessionTimeout: 8,
    enableRealTimeUpdates: true,
    chartRefreshRate: 30,
  });

  // Mock data for demonstration
  const mockTerminals = [
    { id: 1, name: 'Terminal 1', status: 'online', todaySales: 1250.50, transactions: 45, lastSync: '2 min ago' },
    { id: 2, name: 'Terminal 2', status: 'online', todaySales: 890.25, transactions: 32, lastSync: '1 min ago' },
    { id: 3, name: 'Terminal 3', status: 'offline', todaySales: 0, transactions: 0, lastSync: '1 hour ago' },
  ];

  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [1200, 1500, 1800, 1400, 1600, 2100, 1900],
  };

  useEffect(() => {
    // Initialize Google Drive
    const driveManager = new GoogleDriveManager();
    setGoogleDrive(driveManager);

    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', () => {
        driveManager.initialize().then(() => {
          console.log('Google Drive initialized');
        });
      });
    };
    document.head.appendChild(script);

    // Load Google Identity Services
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      console.log('Google Identity Services loaded');
    };
    document.head.appendChild(gisScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(gisScript);
    };
  }, []);

  const handleGoogleAuth = async () => {
    if (googleDrive) {
      try {
        await googleDrive.authenticate();
        setIsGoogleAuthenticated(true);
      } catch (error) {
        console.error('Google authentication failed:', error);
      }
    }
  };

  const handleBackup = async () => {
    if (!isGoogleAuthenticated) {
      await handleGoogleAuth();
    }

    const backupData = {
      sales: sales,
      terminals: mockTerminals,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    const filename = `grocery_backup_${new Date().toISOString().split('T')[0]}.json`;

    await googleDrive.uploadBackup(backupData, filename);
  };

  const handleRestore = async () => {
    // Implementation for restore functionality
    console.log('Restore functionality to be implemented');
  };

  const handleExport = (format, dateRange) => {
    // Implementation for data export
    console.log(`Exporting ${format} for ${dateRange}`);
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dashboardSettings', JSON.stringify(newSettings));
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1><FaShoppingCart /> Grocery Owner Dashboard</h1>
        <div className="header-actions">
          {!isGoogleAuthenticated && (
            <button onClick={handleGoogleAuth} className="google-auth-btn">
              <FaCloudUploadAlt /> Connect Google Drive
            </button>
          )}
          <button className="sync-btn">
            <FaSync /> Sync Now
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine /> Overview
        </button>
        <button
          className={activeTab === 'terminals' ? 'active' : ''}
          onClick={() => setActiveTab('terminals')}
        >
          <FaDesktop /> Terminals
        </button>
        <button
          className={activeTab === 'export' ? 'active' : ''}
          onClick={() => setActiveTab('export')}
        >
          <FaFileExport /> Export
        </button>
        <button
          className={activeTab === 'backup' ? 'active' : ''}
          onClick={() => setActiveTab('backup')}
        >
          <FaCloudUploadAlt /> Backup
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          <FaCog /> Settings
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaDollarSign />
                </div>
                <div className="stat-content">
                  <h3>Total Sales</h3>
                  <p className="stat-value">${sales.total.toFixed(2)}</p>
                  <span className="stat-change positive">+12.5%</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FaShoppingCart />
                </div>
                <div className="stat-content">
                  <h3>Today's Sales</h3>
                  <p className="stat-value">${sales.today.toFixed(2)}</p>
                  <span className="stat-change positive">+8.2%</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <h3>Active Terminals</h3>
                  <p className="stat-value">{sales.terminals}</p>
                  <span className="stat-change neutral">2 online</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FaChartLine />
                </div>
                <div className="stat-content">
                  <h3>Avg Transaction</h3>
                  <p className="stat-value">$24.50</p>
                  <span className="stat-change positive">+5.1%</span>
                </div>
              </div>
            </div>
            <div className="charts-section">
              <div className="chart-container">
                <SalesChart data={salesData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terminals' && (
          <TerminalStatus terminals={mockTerminals} />
        )}

        {activeTab === 'export' && (
          <DataExport onExport={handleExport} />
        )}

        {activeTab === 'backup' && (
          <BackupManager onBackup={handleBackup} onRestore={handleRestore} />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel settings={settings} onSettingsChange={handleSettingsChange} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
