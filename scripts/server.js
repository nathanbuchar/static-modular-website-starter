import express from 'express';

const app = express();

app.use(express.static('dist', {
  dotfiles: 'allow',
}));

app.listen(3000, () => {
  console.log('Server available at http://localhost:3000');
});
