import * as React from 'react';
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
import GraphQL from './utilities/graphql/GraphQL';


const UPDATE_ORDER_PRODUCT = `
  mutation updateOrderProduct($id: Int!, $endedAt: timestamptz!) {
    update_order_product_by_pk(pk_columns: {id: $id}, _set: {ended_at: $endedAt}) {
      id
      ended_at
    }
  }
`;

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

function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);
    const [products, setProducts] = React.useState(row.orderProduct);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleDateChange = (index, event) => {
        const newProducts = [...products];
        newProducts[index].ended_at = event.target.value;
        setProducts(newProducts);
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        try {
            for (const product of products) {
                const variables = { id: product.id, endedAt: product.ended_at };
                const gql = new GraphQL(UPDATE_ORDER_PRODUCT, variables);
                await gql.execute();
            }
            setMessage('所有變更已成功保存');
        } catch (error) {
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
                                        <TableCell>原截止日</TableCell>
                                        <TableCell>修改截止日</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell component="th" scope="row">
                                                {product.name}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {moment(product.ended_at).format('YYYY-MM-DD')}
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="date" // 將類型設為 date
                                                    value={moment(product.ended_at).format('YYYY-MM-DD')} // 格式化為只顯示日期
                                                    onChange={(event) => handleDateChange(index, event)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Box
                                sx={{ minWidth: 200, margin: 2 }}
                                display="flex"
                                alignItems="center"
                            >
                            </Box>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

        </React.Fragment >
    );
}



export default function Extension({ memberInfo }) {
    console.log('-------------------', memberInfo)
    const rows = memberInfo ? memberInfo.map(member =>
        createData(
            member.contract_orderId,
            formatDateUsingMoment(member.contract_agreed_at),
            member.name,
            member.email,
            member.contract_orderProducts
        )
    ) : [];

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
                        <Row key={row.orderNumber} row={row} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}