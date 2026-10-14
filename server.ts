import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LeaderboardRecord {
  id: string;
  playerName: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  accuracy: number;
  timeSpentSeconds: number;
  timeSpentFormatted: string;
  timestamp: number;
  roomCode?: string;
  mode: string;
}

interface RoomRecord {
  code: string;
  title: string;
  hostName: string;
  createdAt: number;
  scores: LeaderboardRecord[];
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory competition rooms
const rooms = new Map<string, RoomRecord>();

// Pre-seed a default demonstration competition room "SDA-JUARA"
rooms.set('SDA-JUARA', {
  code: 'SDA-JUARA',
  title: 'Tantangan Geografi Nasional 2026',
  hostName: 'Pak Guru Fachri',
  createdAt: Date.now() - 3600000,
  scores: [
    {
      id: 'demo-1',
      playerName: 'Bima Satria (SMPN 1)',
      score: 9240,
      correctCount: 46,
      wrongCount: 4,
      unansweredCount: 0,
      accuracy: 92,
      timeSpentSeconds: 245,
      timeSpentFormatted: '04:05',
      timestamp: Date.now() - 600000,
      roomCode: 'SDA-JUARA',
      mode: 'competition'
    },
    {
      id: 'demo-2',
      playerName: 'Aisyah Putri (SMP Labschool)',
      score: 8760,
      correctCount: 44,
      wrongCount: 6,
      unansweredCount: 0,
      accuracy: 88,
      timeSpentSeconds: 268,
      timeSpentFormatted: '04:28',
      timestamp: Date.now() - 400000,
      roomCode: 'SDA-JUARA',
      mode: 'competition'
    },
    {
      id: 'demo-3',
      playerName: 'Kenzo Pratama (SMP Taruna)',
      score: 8100,
      correctCount: 41,
      wrongCount: 8,
      unansweredCount: 1,
      accuracy: 84,
      timeSpentSeconds: 290,
      timeSpentFormatted: '04:50',
      timestamp: Date.now() - 200000,
      roomCode: 'SDA-JUARA',
      mode: 'competition'
    }
  ]
});

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', serverTime: Date.now() });
});

// Create Room
app.post('/api/rooms/create', (req, res) => {
  const { code, title, hostName } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Kode room wajib diisi' });
  }
  const cleanCode = String(code).trim().toUpperCase();
  if (rooms.has(cleanCode)) {
    return res.status(200).json({ room: rooms.get(cleanCode), message: 'Room sudah ada, bergabung ke room ini.' });
  }

  const newRoom: RoomRecord = {
    code: cleanCode,
    title: title || `Room Kompetisi ${cleanCode}`,
    hostName: hostName || 'Guru Pembimbing',
    createdAt: Date.now(),
    scores: []
  };

  rooms.set(cleanCode, newRoom);
  return res.status(201).json({ room: newRoom });
});

// Get Room Details
app.get('/api/rooms/:roomId', (req, res) => {
  const code = req.params.roomId.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Room tidak ditemukan' });
  }
  return res.json({
    code: room.code,
    title: room.title,
    hostName: room.hostName,
    createdAt: room.createdAt,
    participantCount: room.scores.length
  });
});

// Get Leaderboard for a room
app.get('/api/rooms/:roomId/scores', (req, res) => {
  const code = req.params.roomId.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    return res.json([]);
  }

  // Sort scores: score DESC, correctCount DESC, timeSpent ASC
  const sorted = [...room.scores].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    return a.timeSpentSeconds - b.timeSpentSeconds;
  });

  return res.json(sorted);
});

// Post Score to a room
app.post('/api/rooms/:roomId/scores', (req, res) => {
  const code = req.params.roomId.trim().toUpperCase();
  let room = rooms.get(code);
  if (!room) {
    // Auto-create room if not found so participants can start immediately
    room = {
      code,
      title: `Kompetisi ${code}`,
      hostName: 'Otomatis',
      createdAt: Date.now(),
      scores: []
    };
    rooms.set(code, room);
  }

  const entry: LeaderboardRecord = req.body;
  if (!entry || !entry.playerName) {
    return res.status(400).json({ error: 'Data skor tidak valid' });
  }

  // Deduplicate by entry ID or player name within room
  room.scores = room.scores.filter(s => s.id !== entry.id);
  room.scores.push(entry);

  return res.status(200).json({ success: true, count: room.scores.length });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
