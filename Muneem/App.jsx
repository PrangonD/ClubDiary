import { useState } from 'react';

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setMessage('Processing...');

    const url = isLogin ? 'http://localhost:5000/login' : 'http://localhost:5000/register';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          setMessage(`✅ ${data.message} You are signed in as an: ${data.user.role}`);
          localStorage.setItem('token', data.token);
        } else {
          setMessage(`✅ ${data.message} Please log in now.`);
          setIsLogin(true); 
        }
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Network error. Make sure your backend server is running on port 5000.');
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial', maxWidth: '400px', margin: '0 auto' }}>
      <h2>{isLogin ? 'Login to ClubDiary' : 'Register for ClubDiary'}</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '10px' }}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px' }}
        />

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}

      <p 
        style={{ marginTop: '20px', cursor: 'pointer', color: 'blue', textDecoration: 'underline', textAlign: 'center' }} 
        onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
      >
        {isLogin ? "Don't have an account? Register here." : "Already have an account? Login here."}
      </p>
    </div>
  );
}