import axios from 'axios';

export async function proxyAudio(audioUrl, req, res) {
  try {
    // Forward range header if present
    const headers = {};
    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    // Make request to audio URL
    const response = await axios({
      method: 'GET',
      url: audioUrl,
      responseType: 'stream',
      headers: headers,
      validateStatus: (status) => status < 500
    });

    // Forward status code
    res.status(response.status);

    // Forward relevant headers
    const headersToForward = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'etag',
      'last-modified'
    ];

    headersToForward.forEach(header => {
      if (response.headers[header]) {
        res.set(header, response.headers[header]);
      }
    });

    // Set accept-ranges if not present
    if (!response.headers['accept-ranges'] && response.status === 206) {
      res.set('accept-ranges', 'bytes');
    }

    // Pipe the response
    response.data.pipe(res);

    // Handle stream errors
    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'PROXY_ERROR',
          message: 'Error streaming audio'
        });
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    if (error.response) {
      // Forward the error status from the audio server
      res.status(error.response.status).json({
        error: 'PROXY_ERROR',
        message: `Audio server returned ${error.response.status}`,
        details: { 
          status: error.response.status,
          statusText: error.response.statusText
        }
      });
    } else if (error.request) {
      // Network error
      res.status(502).json({
        error: 'PROXY_ERROR',
        message: 'Unable to reach audio server',
        details: { error: error.message }
      });
    } else {
      // Other error
      res.status(500).json({
        error: 'PROXY_ERROR',
        message: 'Failed to proxy audio',
        details: { error: error.message }
      });
    }
  }
}