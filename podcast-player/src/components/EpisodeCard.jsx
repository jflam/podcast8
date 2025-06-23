import React from 'react';

function EpisodeCard({ episode, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (duration) => {
    // Duration comes in format HH:MM:SS or MM:SS
    const parts = duration.split(':');
    if (parts.length === 3 && parts[0] === '00') {
      return `${parts[1]}:${parts[2]}`;
    }
    return duration;
  };

  return (
    <div 
      className="episode-card"
      onClick={() => onClick(episode)}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: '#fff'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        {episode.imageUrl && (
          <img 
            src={episode.imageUrl} 
            alt={episode.title}
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h3 className="episode-title" style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
            {episode.title}
          </h3>
          <div style={{ 
            fontSize: '14px', 
            color: '#666',
            marginBottom: '8px'
          }}>
            {episode.episodeNumber && (
              <span>Episode {episode.episodeNumber} • </span>
            )}
            <span>{formatDate(episode.publishDate)}</span>
            {episode.duration && (
              <span> • {formatDuration(episode.duration)}</span>
            )}
          </div>
          <p style={{ 
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.5',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {episode.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EpisodeCard;