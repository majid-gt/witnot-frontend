import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

const FEEDBACK_API_URL = `${import.meta.env.VITE_API_URL || "/api"}/feedback/`;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !feedbackText.trim()) {
      setError('Please select a rating and provide detailed comments.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      rating: rating,
      feedback_text: feedbackText.trim()
    };

    try {
      const response = await fetch(FEEDBACK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include Authorization header if required by the backend:
          // 'Authorization': `Bearer ${localStorage.getItem('accessToken'))}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate('/dashboard',{replace: true}); // Navigate to thank you page
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown server error.' }));
        setError(`Submission Failed (${response.status}): ${errorData.message || 'Please check the API endpoint.'}`);
      }
    } catch (err: any) {
      console.error('Network Error:', err);
      setError('A network error occurred. Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      backgroundColor: '#f4f7f9',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      margin: 0,
      color: '#333'
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{
          color: '#1a1a1a',
          marginBottom: '5px',
          fontWeight: 700,
          fontSize: '1.6em'
        }}>Feedback Survey</h2>
        <p style={{
          color: '#6c757d',
          marginBottom: '30px',
          fontSize: '0.95em'
        }}>Your honest feedback helps us improve our service.</p>

        <fieldset style={{ border: 'none', padding: 0, marginBottom: '10px' }}>
          <legend style={{
            padding: 0,
            margin: 0,
            width: '100%',
            fontWeight: 600,
            color: '#343a40',
            fontSize: '0.95em'
          }}>Rating (Select one): *</legend>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '10px'
          }}>
            {['Outstanding', 'Excellent', 'Good', 'Average', 'Bad'].map((option) => (
              <div key={option} style={{
                flexGrow: 1,
                minWidth: 'calc(20% - 10px)',
                textAlign: 'center',
                border: '1px solid #ced4da',
                borderRadius: '50px',
                cursor: 'pointer',
                backgroundColor: rating === option.toLowerCase() ? '#007bff' : '#ffffff',
                transition: 'background-color 0.2s, border-color 0.2s'
              }}>
                <input
                  type="radio"
                  id={option.toLowerCase()}
                  name="rating"
                  value={option.toLowerCase()}
                  checked={rating === option.toLowerCase()}
                  onChange={(e) => setRating(e.target.value)}
                  style={{ display: 'none' }}
                  required
                />
                <label
                  htmlFor={option.toLowerCase()}
                  style={{
                    display: 'block',
                    cursor: 'pointer',
                    padding: '10px 15px',
                    margin: 0,
                    fontWeight: rating === option.toLowerCase() ? 600 : 500,
                    color: rating === option.toLowerCase() ? 'white' : '#343a40',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="feedback" style={{
            display: 'block',
            marginTop: '20px',
            marginBottom: '8px',
            fontWeight: 600,
            color: '#343a40',
            fontSize: '0.95em'
          }}>Detailed Comments: *</label>
          <textarea
            id="feedback"
            name="feedback_text"
            rows={5}
            placeholder="Share specific details about your experience..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '15px',
              boxSizing: 'border-box',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              marginBottom: '25px',
              resize: 'vertical',
              fontSize: '1em',
              minHeight: '120px',
              color: '#495057',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
          />
        </div>

        {error && <div style={{ color: '#dc3545', marginBottom: '20px' }}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1.1em',
            fontWeight: 600,
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default Feedback;
