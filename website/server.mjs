import path from 'path';
import express from 'express';
import http from 'http';
import axios from 'axios';
import cors from 'cors';
import process from 'process';

const httpApp = express();
httpApp.use(cors());
httpApp.use(express.json())

const staticPath = path.resolve('./dist');
httpApp.use('/', express.static(staticPath));
httpApp.use('/*', express.static(staticPath));

httpApp.post('/imageProxy', async (req, res) => {
  const { data: imageStream } = await axios.get(req.body.url, {
    responseType: 'stream',
  });
  imageStream
    .on('data', data => res.write(data))
    .on('end', () => res.end());
})

http.createServer(httpApp).listen(8000)
