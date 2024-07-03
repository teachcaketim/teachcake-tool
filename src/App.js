import './App.css';
import Navbar from './Navbar';
import Menu from './Menu'
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

function App() {
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Navbar />
      </Grid>
      <Grid item>
        <Box margin={5}>
          <Menu />
        </Box>
      </Grid>
    </Grid>
  );
}

export default App;
