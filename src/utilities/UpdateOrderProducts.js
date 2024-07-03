import React, { useState } from 'react';
import GraphQL from './graphql/GraphQL';

const UPDATE_ORDER_PRODUCTS = `
  mutation updateOrderProductsByOrderId($memberId: String, $startedAt: timestamptz, $endedAt: timestamptz) {
    update_order_product(where: {order_log: {member_id: {_eq: $memberId}}, _and:[{name: {_nlike: "%搶先看%"}}, {name: {_nlike: "%2D動畫%"}}, {name: {_nlike: "%3D動畫%"}}, {name: {_nlike: "%人工智慧%"}}, {name: {_nlike: "%後端%"}}, {name: {_nlike: "%前端%"}}, {name: {_nlike: "%平面設計%"}}, {name: {_nlike: "%商業廣告插畫%"}}, {name: {_nlike: "%影音網紅行銷%"}}, {name: {_nlike: "%軟體開發%"}}, {name: {_nlike: "%UIUX%"}}, {name: {_nlike: "%商用設計%"}}, {name: {_nlike: "%網紅多媒體%"}}, {name: {_nlike: "%產品設計%"}}, {name: {_nlike: "%網站開發%"}}, {name: {_nlike: "%私塾方案%"}}, {name: {_nlike: "%業師諮詢%"}}, {name: {_nlike: "%會員卡%"}}, {name: {_nlike: "%接案計畫%"}}, {name: {_nlike: "%無限教練衝刺計畫%"}}]}, _set: {started_at: $startedAt, ended_at: $endedAt}) {
      returning {
        updated_at
      }
    }
  }
`;

const UpdateOrderProducts = () => {
    const [memberId, setMemberId] = useState('');
    const [startedAt, setStartedAt] = useState('');
    const [endedAt, setEndedAt] = useState('');
    const [message, setMessage] = useState('');

    const handleUpdate = async () => {
        const variables = { memberId, startedAt, endedAt };
        const gql = new GraphQL(UPDATE_ORDER_PRODUCTS, variables);
        try {
            const response = await gql.execute();
            setMessage(`更新成功：${JSON.stringify(response.update_order_product.returning[0].updated_at)}`);
        } catch (error) {
            setMessage(`更新失敗：${error.message}`);
        }
    };

    return (
        <div>
            <h1>更新交付產品</h1>
            <input
                type="text"
                placeholder="會員ID"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
            />
            <input
                type="text"
                placeholder="開始時間"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
            />
            <input
                type="text"
                placeholder="結束時間"
                value={endedAt}
                onChange={(e) => setEndedAt(e.target.value)}
            />
            <button onClick={handleUpdate}>更新</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default UpdateOrderProducts;
