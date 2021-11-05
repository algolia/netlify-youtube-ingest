export default {
    env: {
      NETLIFY_URL: process.env.NETLIFY
        ? process.env.URL
        : 'http://localhost:8888',
    },
  };
  