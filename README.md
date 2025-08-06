# PolicyEngine pulse

Team meeting coordination hub for PolicyEngine.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the example team data:
```bash
cp data/team.json.example data/team.json
```

3. Edit `data/team.json` with your team members.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Randomise standup order for team meetings
- Store meeting history locally during development
- Clean, modern interface

## Deployment

The app is designed to work with Google Cloud Storage for production data storage. Configuration for GCS integration will be added based on your specific setup requirements.
