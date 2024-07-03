import React, { useState } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Extension from './Extension'
import Leave from './Leave';
import AdjustOrder from './AdjustOrder';
import getHasuraMemberContractInfoByEmail from './utilities/ContractInfoByEmail';


export default function Menu() {
    const [brand, setBrand] = useState('');
    const [orderItem, setOrderItem] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [memberInfo, setMemberInfo] = useState(null);

    const handleBrandChange = (event) => {
        setBrand(event.target.value);
    };

    const handleorderItemChange = (event) => {
        setOrderItem(event.target.value);
    };

    const handleEmailChange = (event) => {
        setStudentEmail(event.target.value);
    };


    const handleFetchData = async () => {
        if (brand && orderItem && studentEmail) {
            try {
                const info = await getHasuraMemberContractInfoByEmail(studentEmail, brand);
                setMemberInfo(info);
                console.log('Fetched member info:', info); // 確認返回的數據

            } catch (error) {
                console.error('Failed to fetch member info:', error);
            }
        } else {
            alert('歐歐~有欄位沒填');
        }
    };

    return (
        <>
            <Box
                sx={{ minWidth: 120 }}
                display="flex"
                alignItems="center"
            >
                <FormControl sx={{ width: 200, m: 1 }} required>
                    <InputLabel id="demo-simple-select-label">品牌</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={brand}
                        label="Brand"
                        onChange={handleBrandChange}
                    >
                        <MenuItem value={'xuemi'}>學米</MenuItem>
                        <MenuItem value={'sixdigital'}>無限</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ width: 200, m: 1 }} required>
                    <InputLabel id="demo-simple-select-label">執行項目</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={orderItem}
                        label="Brand"
                        onChange={handleorderItemChange}
                    >
                        <MenuItem value={'adjustOrder'}>修改訂單</MenuItem>
                        <MenuItem value={'leave'}>請假</MenuItem>
                        <MenuItem value={'extension'}>展延</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    sx={{ width: 250 }}
                    id="outlined-basic"
                    label="學生 email"
                    variant="outlined"
                    value={studentEmail}
                    onChange={handleEmailChange}
                    required
                />
                <Box sx={{ p: 2 }}>
                    <Button onClick={handleFetchData} variant="contained">
                        確認
                    </Button>
                </Box>
            </Box>

            <Box>
                {orderItem === 'adjustOrder' && <AdjustOrder memberInfo={memberInfo} />}
                {orderItem === 'leave' && <Leave memberInfo={memberInfo} appId={brand} studentEmail={studentEmail} />}
                {orderItem === 'extension' && <Extension memberInfo={memberInfo} />}
            </Box>

            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100px'
            }}>
            </Box>
        </>
    );
}