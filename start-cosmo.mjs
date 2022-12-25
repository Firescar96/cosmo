import {spawn} from 'child_process';

const process1 = spawn('nodemon', ['backend/server.mjs'])
const process2 = spawn('yarn', ['--cwd','datastore', 'run', 'develop'])
const process3 = spawn('yarn', ['--cwd', 'website', 'run', 'serve'])
const processes = [process1, process2, process3];
processes.forEach(process => {
  process.stdout.on('data', (x) => console.log(x.toString()))
  process.stderr.on('data', (x) => console.error(x.toString()))
});
