import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { RiCustomerService2Line } from "react-icons/ri";


export default function ButtonAppBar() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <RiCustomerService2Line style={{ fontSize: '30px', padding: '12px' }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        會員服務時間異動
                    </Typography>
                    <Button color="inherit"></Button>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
