# Insyd Notification Frontend

This is the ReactJS frontend for the Insyd notification system POC.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```

## Usage
- The app polls the backend for notifications and displays them for a mock user.
- Use the event trigger form to simulate events (e.g., likes, comments).

## Dependencies
- React
- Axios

## API
- Connects to the backend at `/notifications/:userId` and `/events` endpoints.
