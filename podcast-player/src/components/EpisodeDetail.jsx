import React from 'react';
import AudioPlayer from './AudioPlayer';

function EpisodeDetail({ episode, onBack }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '20px',
          padding: '8px 16px',
          borderRadius: '4px',
          backgroundColor: '#f0f0f0'
        }}
      >
        ← Back to episodes
      </button>

      <div style={{ marginBottom: '24px' }}>
        {episode.imageUrl && (
          <img 
            src={episode.imageUrl} 
            alt={episode.title}
            style={{
              width: '200px',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
              float: 'left',
              marginRight: '24px',
              marginBottom: '16px'
            }}
          />
        )}
        
        <h1 style={{ marginTop: 0, marginBottom: '16px' }}>
          {episode.title}
        </h1>
        
        <div style={{ 
          fontSize: '14px', 
          color: '#666',
          marginBottom: '16px'
        }}>
          {episode.episodeNumber && (
            <span>Episode {episode.episodeNumber} • </span>
          )}
          <span>{formatDate(episode.publishDate)}</span>
          {episode.duration && (
            <span> • Duration: {episode.duration}</span>
          )}
          {episode.author && (
            <span> • By {episode.author}</span>
          )}
        </div>

        <AudioPlayer episode={episode} />

        <div style={{ clear: 'both' }} />
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2>Description</h2>
        {episode.descriptionHtml ? (
          <div 
            dangerouslySetInnerHTML={{ __html: episode.descriptionHtml }}
            style={{
              lineHeight: '1.6',
              fontSize: '16px'
            }}
          />
        ) : (
          <p style={{
            lineHeight: '1.6',
            fontSize: '16px'
          }}>
            {episode.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default EpisodeDetail;