const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const apiKey = process.env.GOOGLE_ANALYTICS_API_KEY;
  const viewId = 'YOUR_VIEW_ID';
  const startDate = '2021-01-01';
  const endDate = '2021-12-31';
  const metrics = ['ga:users', 'ga:sessions', 'ga:pageviews'];

  const url = 'https://analyticsreporting.googleapis.com/v4/reports:batchGet';

  const requestBody = {
    reportRequests: [
      {
        viewId: viewId,
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate,
          },
        ],
        metrics: metrics.map(metric => ({ expression: metric })),
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    res.status(500).json({ message: 'Error fetching Google Analytics data' });
  }
};
