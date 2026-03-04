import React, { useState, useEffect, useRef } from 'react';
import { Lock, LockOpen, Calendar, Clock, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import imageLogo from '../assets/image1.png';
import './ExamDashboard.css'; // Import CSS file

const ExamDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [rollNumber, setRollNumber] = useState('');
  const [examName, setExamName] = useState('Loading...');
  const [examUnlockTime, setExamUnlockTime] = useState(new Date());
  const [_examLockTime, _setExamLockTime] = useState(new Date()); // underscore = silence TS unused var warning
  const [_loading, _setLoading] = useState(true);
  const [_error, _setError] = useState('');
  const [examStatus, setExamStatus] = useState('');
  const navigate = useNavigate();

  // Prevents double-fetching due to React Strict Mode re-renders
  const hasFetchedRef = useRef(false); 

  const isExamUnlocked = currentTime >= examUnlockTime;
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";


  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (userName) setRollNumber(userName);

    const fetchDashboardData = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        _setError('No access token found. Please log in again.');
        _setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();

        setExamName(data.exam_name);
        setExamUnlockTime(new Date(data.exam_start));
        _setExamLockTime(new Date(data.exam_end));
        setExamStatus(data.exam_status?.toLowerCase() || '');
        
      } catch (err: any) {
        _setError(err.message || 'Error loading dashboard data');
      } finally {
        _setLoading(false);
      }
    };

    fetchDashboardData();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeUntilUnlock = () => {
    const diff = examUnlockTime.getTime() - currentTime.getTime();
    if (diff <= 0) return "Available Now";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `Unlocks in ${h}h ${m}m ${s}s`;
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      const response = await fetch('http://10.68.179.254:8000/api/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!response.ok) {
        console.error('Logout API failed, but proceeding with local logout.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div>
            <img src={imageLogo} alt="Logo" style={{ width: '57px', height: '37px' }} />
          </div>
          <div>
            <h1>WITNOT DASHBOARD</h1>
          </div>
        </div>
        <div className='dash'>
          <nav>
            <a href="#" className="active"><Home size={18}/> Dashboard</a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header"> 
          <div className="header-right">
            <div>
              <h3>Welcome Back!</h3>
              <h2>{rollNumber}</h2> 
            </div>
            
            <button
              className="logout-btn"
              onClick={handleLogout}
              style={{
                position: 'absolute',
                top: '40px',
                right: '30px',
                backgroundColor: '#050842ff',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '29px'
              }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        {/* Upcoming Exam */}
        <section className="exam-section">
          <h3>Upcoming Exam</h3>
          <div className={`exam-card ${isExamUnlocked ? 'unlocked' : ''}`}>
            <div className="exam-header">
              <div>
                <h4>{examName}</h4>
                <span className={`status ${isExamUnlocked ? 'available' : 'locked'}`}>
                  {isExamUnlocked ? 'Available' : 'Locked'}
                </span>
                <p>Quiz IOT</p>
              </div>
              <div className={`lock-icon ${isExamUnlocked ? 'green' : ''}`}>
                {isExamUnlocked ? <LockOpen color="white" size={30}/> : <Lock color="white" size={30}/>}
              </div>
            </div>

            <div className="exam-details">
              <div>
                <Calendar size={16}/> <b>Date:</b> {currentTime.toLocaleDateString()}
              </div>
              <div>
                <Clock size={16}/> <b>Duration:</b> 90 Minutes
              </div>
            </div>

            <div className={`exam-status ${isExamUnlocked ? 'status-available' : 'status-locked'}`}>
              {isExamUnlocked ? '✓ The exam is now available. You can start whenever you’re ready!' : `⏱ ${getTimeUntilUnlock()}`}
            </div>

            <button
              disabled={!isExamUnlocked || examStatus === 'completed'}
              className={`exam-button ${isExamUnlocked && examStatus !== 'completed' ? 'active' : ''}`}
              onClick={() => {
                if (isExamUnlocked && examStatus !== 'completed') {
                  navigate('/quiz', { replace: true });
                }
              }}
            >
              {examStatus === 'ongoing'
                ? 'Resume Exam'
                : examStatus === 'completed'
                ? 'Completed'
                : isExamUnlocked
                ? 'Start Exam'
                : 'Exam Locked'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ExamDashboard;
