const API_BASE = '';  // Using proxy, so relative URLs work

class ApiClient {
  async fetchFeed() {
    try {
      const response = await fetch('/api/feed');
      if (!response.ok) {
        if (response.status === 503) {
          const data = await response.json();
          if (data.feed) {
            // Return cached data with warning
            return {
              feed: data.feed,
              cached: true,
              error: 'Using cached data - RSS feed temporarily unavailable'
            };
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        feed: data.feed,
        cached: data.cached,
        error: null
      };
    } catch (error) {
      console.error('Error fetching feed:', error);
      return {
        feed: null,
        cached: false,
        error: error.message
      };
    }
  }

  async refreshFeed() {
    try {
      const response = await fetch('/api/feed/refresh');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        feed: data.feed,
        newEpisodes: data.newEpisodes,
        error: null
      };
    } catch (error) {
      console.error('Error refreshing feed:', error);
      return {
        feed: null,
        newEpisodes: 0,
        error: error.message
      };
    }
  }

  getAudioProxyUrl(audioUrl) {
    return `/api/proxy/audio?url=${encodeURIComponent(audioUrl)}`;
  }

  async checkHealth() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export default new ApiClient();