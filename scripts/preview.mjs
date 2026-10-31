import './export-preview.mjs';
import http from 'node:http';
import { handlePreviewRequest } from './preview-handler.mjs';
const port = Number(process.env.PORT || 4173);
http.createServer(handlePreviewRequest).listen(port, '127.0.0.1', () => console.log(`Local CV review: http://localhost:${port}`));
