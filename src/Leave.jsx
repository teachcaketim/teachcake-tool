import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { TextField, Button } from '@mui/material';
import { patchHasuraOrderProductsByMemberId } from './utilities/mutations';
import { gql } from '@apollo/client';
import client from './utilities/client';



function formatDateUsingMoment(dateString) {
    return moment(dateString).format('YYYY-MM-DD HH:mm');
}

function createData(orderNumber, startDate, name, email, orderProduct) {
    return {
        orderNumber,
        startDate,
        name,
        email,
        orderProduct,
    };
}

const GET_ORDER_LOGS = gql`
  query GET_ORDER_LOGS($id: String) {
    order_log(where: {id: {_eq: $id}}) {
      id
      created_at
      status
      is_deleted
      member {
        name
        email
      }
      order_products {
        id
        name
        started_at
        ended_at
        delivered_at
      }
    }
  }
`;

const fetchApiData = async (id, setApiData) => {
    try {
        //console.log(`Fetching order logs for ID: ${id}`);
        const { data } = await client.query({
            query: GET_ORDER_LOGS,
            variables: { id },
        });
        const orderProducts = data.order_log[0].order_products;
        setApiData(orderProducts);
        //console.log(`Order logs fetched successfully: ${JSON.stringify(orderProducts)}`);
    } catch (error) {
        console.error('Error fetching API data:', error);
    }
};


function Row(props) {
    const { row, appId, studentEmail, refreshData } = props;
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [products, setProducts] = React.useState(row.orderProduct);
    const [message, setMessage] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [apiData, setApiData] = React.useState([]);
    const today = new Date();
    const isAfterEnd = products.some(product => today <= new Date(product.ended_at));

    useEffect(() => {
        fetchApiData(row.orderNumber, setApiData);
    }, [row.orderNumber]);

    const handleSave = async () => {
        setLoading(true);
        setMessage('');

        try {
            const start = moment(startDate);
            const end = moment(endDate);
            const days = end.diff(start, 'days');
            const today = moment().startOf('day');
            if (start.isBefore(today)) {
                throw new Error('不能請過去的日期');
            }

            if (days <= 0) {
                throw new Error('結束日要在開始日之後哦');
            }

            const updatedProducts = [...products];

            for (let i = 0; i < updatedProducts.length; i++) {
                const product = updatedProducts[i];
                if (!product.member_id) {
                    throw new Error(`產品 ${product.name} 缺少 member_id`);
                }
                const originalEndDate = moment(apiData[i].ended_at);
                const newEndDate = originalEndDate.clone().add(days, 'days').format('YYYY-MM-DD');
                console.log(originalEndDate.format('YYYY-MM-DD'));
                console.log(newEndDate);
                console.log('印出newEndDate');
                await patchHasuraOrderProductsByMemberId(studentEmail, appId, newEndDate);
            }
            setProducts(updatedProducts);
            setMessage('所有變更已成功保存');
            refreshData();
            await fetchApiData(row.orderNumber, setApiData);
        } catch (error) {
            console.error('Error details:', error);
            setMessage(`保存變更失敗：${error.message}`);
        }
        setLoading(false);
    };

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.orderNumber}
                </TableCell>
                <TableCell align="right">{row.startDate}</TableCell>
                <TableCell align="right">{row.name}</TableCell>
                <TableCell align="right">{row.email}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                訂單詳情
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>專案名稱</TableCell>
                                        <TableCell>截止日</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell component="th" scope="row">
                                                {product.name}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {apiData[index]?.ended_at ? moment(apiData[index].ended_at).format('YYYY-MM-DD') : '沒有產品QQ'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {isAfterEnd && (
                                <Box sx={{ minWidth: 200, margin: 2 }} display="flex" alignItems="center">
                                    <Box sx={{ minWidth: 50, margin: 2 }}>
                                        請假開始日
                                    </Box>
                                    <Box sx={{ minWidth: 200, margin: 2 }}>
                                        <TextField
                                            id="start-date"
                                            variant="outlined"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </Box>
                                    <Box sx={{ minWidth: 50, margin: 2 }}>
                                        請假結束日
                                    </Box>
                                    <Box sx={{ minWidth: 200, margin: 2 }}>
                                        <TextField
                                            id="end-date"
                                            variant="outlined"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </Box>
                                    <Button variant="contained" onClick={handleSave} disabled={loading}>
                                        {loading ? '正在送出...' : '送出'}
                                    </Button>
                                    {message && <p>{message}</p>}
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}



export default function Leave({ memberInfo, appId, studentEmail }) {
    const [rows, setRows] = useState([]);

    const refreshData = () => {
        if (memberInfo) {
            const formattedData = memberInfo.map(member =>
                createData(
                    member.contract_orderId,
                    formatDateUsingMoment(member.contract_agreed_at),
                    member.name,
                    member.email,
                    member.contract_orderProducts.map(product => ({
                        ...product,
                        member_id: member.member_id
                    }))
                )
            );
            setRows(formattedData);
        }
    };

    useEffect(() => {
        refreshData();
    }, [memberInfo]);

    return (
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>訂單編號</TableCell>
                        <TableCell align="right">簽約日期</TableCell>
                        <TableCell align="right">姓名</TableCell>
                        <TableCell align="right">Email</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <Row key={row.orderNumber} row={row} appId={appId} studentEmail={studentEmail} refreshData={refreshData} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
