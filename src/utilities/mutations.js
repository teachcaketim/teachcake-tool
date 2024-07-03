import { gql } from '@apollo/client';
import client from './client';
import moment from 'moment';


const PATCH_HASURA_COUPON_PLAN = gql`
  mutation patchCouponPlan($couponPlanId: uuid, $endedAt: timestamptz) {
    update_coupon_plan(
      where: { id: { _eq: $couponPlanId } },
      _set: {ended_at: $endedAt }
    ) {
      returning {
        updated_at
      }
    }
  }
`;

const GET_COIN_LOG_AND_COUPONS = gql`
  query getCoinLogAndCouponsByMemberContractId($memberContractId: uuid!) {
    member_contract(where: { id: { _eq: $memberContractId } }) {
      values
    }
  }
`;

const UPDATE_ORDER_PRODUCTS_EXCLUDE = gql`
  mutation updateOrderProductsExclude($memberId: String!, $endedAt: timestamptz!) {
    update_order_product(
      where: {
        order_log: { member_id: { _eq: $memberId } },
        product_id: { _nlike: "ProgramPackagePlan%" }
      },
      _set: { ended_at: $endedAt }
    ) {
      returning {
        updated_at
        name
        product_id
      }
    }
  }
`;

const UPDATE_ORDER_PRODUCTS_INCLUDE = gql`
  mutation updateOrderProductsInclude($memberId: String!, $endedAtPlusOneYear: timestamptz!) {
    update_order_product(
      where: {
        order_log: { member_id: { _eq: $memberId } },
        product_id: { _like: "ProgramPackagePlan%" }
      },
      _set: { ended_at: $endedAtPlusOneYear }
    ) {
      returning {
        updated_at
        name
        product_id
      }
    }
  }
`;


const PATCH_COIN_LOG = gql`
  mutation patchCoinLog($coinLogId: uuid!, $endedAt: timestamptz!) {
    update_coin_log(where: {id: {_eq: $coinLogId}}, _set: {ended_at: $endedAt}) {
      returning {
        id
      }
    }
  }
`;

const GET_MEMBER_CONTRACT_INFO = gql`
  query getMemberContractInfoByEmail($email: [String!], $appId: String!) {
    member_contract(
      where: {
        agreed_at: { _is_null: false },
        revoked_at: { _is_null: true },
        member: { email: { _in: $email }, app_id: { _eq: $appId } }
      }
    ) {
      id
      values
      agreed_at
      contract {
        name
      }
      member {
        id
        name
        email
        app_id
      }
    }
  }
`;

const getHasuraCoinLogAndCouponsByMemberContractId = async (memberContractId) => {
  try {
    console.log(`開始讀取兌換券與代幣：${memberContractId}。`);
    const { data } = await client.query({
      query: GET_COIN_LOG_AND_COUPONS,
      variables: { memberContractId },
    });
    const values = data.member_contract[0].values;
    let result = {};
    result.couponPlanId = values?.coupons?.filter?.(v => v.coupon_code.data.coupon_plan)[0].coupon_code.data.coupon_plan.data.id;
    result.coinLogId = values?.coinLogs?.filter?.(v => v.description.includes("代幣"))[0].id;
    console.log(`讀取兌換券與代幣成功。${JSON.stringify(result)}`);
    return result;
  } catch (e) {
    console.log(`讀取兌換券與代幣失敗。${e}`);
    throw e;
  }
};

const patchHasuraCoinLog = async (coinLogId, endedAt) => {
  try {
    console.log(`開始更新代幣：${coinLogId}。`);
    const { data } = await client.mutate({
      mutation: PATCH_COIN_LOG,
      variables: { coinLogId, endedAt },
    });
    const id = data.update_coin_log.returning[0].id;
    console.log(`更新代幣成功 ${id}。`);
    return id;
  } catch (e) {
    console.log(`更新代幣失敗。${e}`);
    throw e;
  }
};

const patchHasuraCouponPlan = async (couponPlanId, endedAt) => {
  try {
    console.log(`開始更新兌換券：${couponPlanId}，時間：${endedAt}。`);

    const { data } = await client.mutate({
      mutation: PATCH_HASURA_COUPON_PLAN,
      variables: { couponPlanId, endedAt },
    });

    const updated_at = data.update_coupon_plan.returning[0].updated_at;
    console.log(`更新兌換券成功。${JSON.stringify(updated_at)}`);

    return updated_at;
  } catch (e) {
    console.error(`更新兌換券失敗。${e}`);
    throw e;
  }
};

const getHasuraMemberContractInfo = async (email, appId) => {
  try {
    console.log(`讀取會員資料。email: ${email}`);
    const { data } = await client.query({
      query: GET_MEMBER_CONTRACT_INFO,
      variables: { email, appId },
    });
    return data.member_contract.map(v => ({
      member_id: v.member.id,
      member_contract_id: v.id,
      contract_name: v.contract.name,
      contract_agreed_at: v.agreed_at,
      contract_revoked_at: v.revoked_at,
      contract_invoice_name: v.values.invoice.name,
      contract_orderProducts: v.values.orderId, // 假設這是正確的欄位名
    }));
  } catch (e) {
    console.log(`讀取會員資料失敗。${e}`);
    throw e;
  }
};


export const patchHasuraOrderProductsByMemberId = async (email, appId, endedAt) => {
  try {

    const memberInfo = await getHasuraMemberContractInfo(email, appId);
    if (!memberInfo.length) {
      throw new Error('未找到對應的會員合約');
    }
    const memberContractId = memberInfo[0].member_contract_id;
    const memberId = memberInfo[0].member_id;

    const coinLogAndCoupons = await getHasuraCoinLogAndCouponsByMemberContractId(memberContractId);
    console.log(coinLogAndCoupons);
    console.log('印出coinLogAndCoupons');
    const coinLogId = coinLogAndCoupons.coinLogId;
    const couponPlanId = coinLogAndCoupons.couponPlanId;

    const endedAtPlusOneYear = moment(endedAt).add(1, 'year').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    console.log('Variables:', { memberId, endedAt, endedAtPlusOneYear });

    const { data: dataExclude } = await client.mutate({
      mutation: UPDATE_ORDER_PRODUCTS_EXCLUDE,
      variables: { memberId, endedAt },
    });

    dataExclude.update_order_product.returning.forEach(product => {
      console.log(`更新交付產品成功（排除項目）。產品名稱：${product.name}，產品ID：${product.product_id}，更新時間：${product.updated_at}`);
    });


    const { data: dataInclude } = await client.mutate({
      mutation: UPDATE_ORDER_PRODUCTS_INCLUDE,
      variables: { memberId, endedAtPlusOneYear },
    });

    dataInclude.update_order_product.returning.forEach(product => {
      console.log(`更新交付產品成功（包含項目）。產品名稱：${product.name}，產品ID：${product.product_id}，更新時間：${product.updated_at}`);
    });

    await patchHasuraCoinLog(coinLogId, endedAt);

    //await patchHasuraCouponPlan(couponPlanId, endedAt);

    return {
      exclude: dataExclude.update_order_product.returning.map(product => product.updated_at),
      include: dataInclude.update_order_product.returning.map(product => product.updated_at)
    };
  } catch (error) {
    console.error(`更新交付產品失敗。`, error.networkError || error.graphQLErrors || error.message);
    throw error;
  }
};
