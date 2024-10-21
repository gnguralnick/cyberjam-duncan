import { useEffect } from 'react';
import './App.css';
import { useBackendFetch } from './hooks';

function App() {

  const { loading, error, data, fetchData } = useBackendFetch<{ message: string }>('/');

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>{data.message}</p>}
    </main>
  )
}

export default App;
