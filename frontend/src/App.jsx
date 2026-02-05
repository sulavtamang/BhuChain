import { useState } from 'react';
import { login, getUsers } from './services/api';
import { connectWallet, getParcelCount } from './services/blockchain';

function App() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [parcelCount, setParcelCount] = useState(0);

  // 1. Function to handle logging in
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      // Save your Django token
      localStorage.setItem('authToken', data.token);
      alert('Logged in! Now fetching data...');
      fetchData();
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.non_field_errors || err.message));
    }
  };

  // 2. Function to fetch data (now that we have a token)
  const fetchData = async () => {
    try {
      const data = await getUsers();
      setUsers(data.results || []); // Django REST uses .results for paginated data
    }catch (err) {
      console.error('Fetch error:', err);
    }
  };

  // Test blockchain connection
  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      alert(`Connected: ${address}`);

      //Fetch parcel count from blockchain
      const count = await getParcelCount();
      setParcelCount(count);
    } catch (err) {
      alert ('Wallet connection failed: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>BhuChain API Testing</h1>

      {/* Simple Login Form */}
      <form onSubmit={handleLogin}>
        <input
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type='submit'>Login & Fetch</button>
      </form>

      <hr />

      {/* Display Results */}
      <h3>User Profiles from Backend:</h3>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.full_name} - Role: {u.role} ({u.wallet_address})
          </li>
        ))}
      </ul>

      <hr />

      {/* Blockchain Test */}
      <h3>Blockchain Connection:</h3>
      <button onClick={handleConnectWallet}>Connect MetaMask</button>
      {walletAddress && (
        <div>
          <p>Wallet: {walletAddress}</p>
          <p>Total Parcels in Blockchain: {parcelCount}</p>
        </div>
      )}
    </div>
  );
}

export default App;