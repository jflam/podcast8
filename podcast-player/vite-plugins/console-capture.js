export function consoleCapture() {
  return {
    name: 'console-capture',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `<script>
          (function() {
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info,
              debug: console.debug
            };
            
            function sendToServer(level, args) {
              try {
                const message = args.map(arg => {
                  if (typeof arg === 'object') {
                    return JSON.stringify(arg, null, 2);
                  }
                  return String(arg);
                }).join(' ');
                
                fetch('/__console', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ level, message, timestamp: new Date().toISOString() })
                }).catch(() => {});
              } catch (e) {}
            }
            
            ['log', 'error', 'warn', 'info', 'debug'].forEach(level => {
              console[level] = function(...args) {
                originalConsole[level].apply(console, args);
                sendToServer(level, args);
              };
            });
          })();
        </script>
        </head>`
      );
    },
    configureServer(server) {
      server.middlewares.use('/__console', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { level, message, timestamp } = JSON.parse(body);
              const color = {
                log: '\x1b[0m',
                error: '\x1b[31m',
                warn: '\x1b[33m',
                info: '\x1b[36m',
                debug: '\x1b[90m'
              }[level] || '\x1b[0m';
              
              console.log(`[FRONTEND] ${color}[${level.toUpperCase()}] ${message}\x1b[0m`);
            } catch (e) {}
          });
          res.statusCode = 204;
          res.end();
        }
      });
    }
  };
}