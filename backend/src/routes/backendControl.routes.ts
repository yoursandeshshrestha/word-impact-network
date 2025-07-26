import { Router } from 'express';
import {
  getBackendControlStatus,
  enableBackend,
  disableBackend,
  toggleBackend,
} from '../controllers/backendControl.controller';

const router = Router();

// Secret route path - hard to guess
const SECRET_PATH =
  'x9k2m7p4q8r3s6t1u5v0w2y7z4a8b3c6d1e5f0g2h7i4j8k3l6m1n5o0p2q7r4s8t3u6v1w5x0y2z7a4b8c3d6e1f5g0h2i7j4k8l3m6n1o5p0q2r7s4t8u3v6w1x5y0z2a7b4c8d3e6f1g5h0i2j7k4l8m3n6o1p5q0r2s7t4u8v3w6x1y5z0';

// Get backend status
router.get(`/${SECRET_PATH}/status`, getBackendControlStatus);

// Enable backend
router.post(`/${SECRET_PATH}/enable`, enableBackend);

// Disable backend
router.post(`/${SECRET_PATH}/disable`, disableBackend);

// Toggle backend status
router.post(`/${SECRET_PATH}/toggle`, toggleBackend);

export default router;
