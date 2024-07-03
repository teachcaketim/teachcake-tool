import { retrieveHasuraData } from './api/api.js';

class GraphQL {
  constructor(query, variables, appId) {
    this.query = query;
    this.operationName = query.trim().split("\n")[0].match(/^(query|mutation)\s+(\w+)\(/)[2];
    this.variables = variables;
    this.payload = {
      operationName: this.operationName,
      query: this.query,
      variables: this.variables
    };
    this.appId = appId;
  }

  async execute() {
    console.log(JSON.stringify(this.payload));
    try {
      const getData = await retrieveHasuraData(this.appId);
      const response = await getData(this.payload);
      if (response.errors) {
        throw new Error(JSON.stringify(response.errors));
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching data: ", error);
      throw error;
    }
  }
}


const getHasuraMemberContractInfo = async (memberKey, type, memberValue, appId, requestColumnNames) => {
  console.log(`讀取會員資料。${memberKey}: ${memberValue}`);
  const query = `
    query getMemberContractInfoByEmail($${memberKey}: ${type}, $appId: String!) {
      member_contract(where: {agreed_at: {_is_null: false}, revoked_at: {_is_null: true}, member: {${memberKey}: {_in: $${memberKey}}, app_id: {_eq: $appId}}}) {
        id
        values
        agreed_at
        contract {
          name
        }
        member{
          ${requestColumnNames.join("\n")}
        }
      }
    }`;
  let variable = { "appId": appId };
  variable[memberKey] = memberValue;
  const connection = new GraphQL(query, variable, appId);
  try {
    const response = await connection.execute();
    return response.member_contract.map(v => {
      v.member.member_id = v.member.id;
      v.member.member_contract_id = v.id;
      v.member.contract_name = v.contract.name;
      v.member.contract_agreed_at = v.agreed_at;
      v.member.contract_revoked_at = v.revoked_at;
      v.member.contract_invoice_name = v.values.invoice.name;
      v.member.contract_orderId = v.values.orderId;
      v.member.contract_invoice_email = v.values.invoice.email;
      v.member.contract_orderProducts = v.values.orderProducts;
      v.member.order_id = v.values.orderId;
      return v.member;
    });
  } catch (e) {
    console.log(`讀取會員資料失敗。${e}`);
    throw e;  // 重新拋出錯誤以便調用者可以處理
  }
};

const getHasuraMemberContractInfoByEmail = async (email, appId) => {
  // 正確的數據類型和異步處理
  return await getHasuraMemberContractInfo("email", "[String]", [email], appId, ["id", "name", "email", "app_id"]);
};

export default getHasuraMemberContractInfoByEmail;

