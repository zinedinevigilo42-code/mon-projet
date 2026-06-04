import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Montée à 50 utilisateurs
    { duration: '1m', target: 100 },   // 100 utilisateurs pendant 1 minute
    { duration: '30s', target: 0 },    // Descente à 0
  ],
};

export default function () {
  http.get('http://localhost:8000/api/boissons/');
  sleep(1);
}