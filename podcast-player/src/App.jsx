import { useState, useEffect } from 'react';
import './App.css';
import apiClient from './lib/api-client';
import EpisodeCard from './components/EpisodeCard';
import EpisodeDetail from './components/EpisodeDetail';

function App() {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    setError(null);
    
    const result = await apiClient.fetchFeed();
    
    if (result.error) {
      setError(result.error);
      setIsOffline(result.cached);
    }
    
    if (result.feed) {
      setFeed(result.feed);
    }
    
    setLoading(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    const result = await apiClient.refreshFeed();
    
    if (result.error) {
      setError(result.error);
    } else {
      setFeed(result.feed);
      setError(null);
      setIsOffline(false);
      if (result.newEpisodes > 0) {
        alert(`Found ${result.newEpisodes} new episode${result.newEpisodes > 1 ? 's' : ''}!`);
      }
    }
    
    setLoading(false);
  };

  const handleEpisodeClick = (episode) => {
    setSelectedEpisode(episode);
    // Update URL for direct linking
    window.history.pushState({}, '', `/episode/${episode.guid}`);
  };

  const handleBack = () => {
    setSelectedEpisode(null);
    window.history.pushState({}, '', '/');
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') {
        setSelectedEpisode(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading podcast episodes...</h2>
      </div>
    );
  }

  if (selectedEpisode) {
    return <EpisodeDetail episode={selectedEpisode} onBack={handleBack} />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          {feed?.imageUrl && (
            <img 
              src={feed.imageUrl} 
              alt={feed?.title}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px'
              }}
            />
          )}
          <div>
            <h1 style={{ margin: 0 }}>{feed?.title || 'Podcast Player'}</h1>
            <p style={{ margin: '8px 0', color: '#666' }}>
              {feed?.description}
            </p>
          </div>
        </div>

        {isOffline && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            ⚠️ Offline mode - showing cached episodes
          </div>
        )}

        {error && !feed && (
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            Error: {error}
          </div>
        )}

        <button
          onClick={handleRefresh}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#1976d2',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Refresh Episodes
        </button>
      </header>

      <main>
        {feed?.episodes && feed.episodes.length > 0 ? (
          <div>
            <h2>Episodes ({feed.episodes.length})</h2>
            {feed.episodes.map((episode) => (
              <EpisodeCard
                key={episode.guid}
                episode={episode}
                onClick={handleEpisodeClick}
              />
            ))}
          </div>
        ) : (
          <p>No episodes available</p>
        )}
      </main>
    </div>
  );
}

export default App
