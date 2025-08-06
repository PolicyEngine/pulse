// This file would be deployed as a Google Cloud Function
// It handles reading/writing to GCS bucket for production

const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const BUCKET_NAME = 'policyengine-pulse-data';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://policyengine.github.io',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).set(corsHeaders).send('');
    return;
  }

  res.set(corsHeaders);

  const { type, data } = req.body;
  const bucket = storage.bucket(BUCKET_NAME);

  try {
    if (req.method === 'GET') {
      if (type === 'team') {
        const file = bucket.file('team.json');
        const [exists] = await file.exists();
        
        if (exists) {
          const [contents] = await file.download();
          res.json(JSON.parse(contents.toString()));
        } else {
          res.json({
            team: ['Max', 'Nikhil', 'Pavel', 'Anthony', 'Vahid', 'Daphne', 'David', 'María', 'Ziming'],
            meetings: []
          });
        }
      } else if (type === 'survey') {
        const file = bucket.file('surveys.json');
        const [exists] = await file.exists();
        
        if (exists) {
          const [contents] = await file.download();
          res.json(JSON.parse(contents.toString()));
        } else {
          res.json({ responses: [] });
        }
      }
    } else if (req.method === 'POST') {
      if (type === 'survey') {
        const file = bucket.file('surveys.json');
        const [exists] = await file.exists();
        
        let surveyData = { responses: [] };
        if (exists) {
          const [contents] = await file.download();
          surveyData = JSON.parse(contents.toString());
        }
        
        data.timestamp = new Date().toISOString();
        surveyData.responses.push(data);
        
        await file.save(JSON.stringify(surveyData, null, 2), {
          contentType: 'application/json',
        });
        
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};