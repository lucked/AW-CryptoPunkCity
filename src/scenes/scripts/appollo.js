import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

/** Aave thegraph API url*/
const APIURL = "https://api.thegraph.com/subgraphs/name/aave/aave-v2-matic";

/** Token query params*/
const tokensQuery = `
  query {
    reserves {
      name
      underlyingAsset
      
      liquidityRate 
      stableBorrowRate
      variableBorrowRate
      
      aEmissionPerSecond
      vEmissionPerSecond
      sEmissionPerSecond
      
      totalATokenSupply
      totalCurrentVariableDebt
    }
  }
`;

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
});

/** Function for getting info about aave protocol
 * @returns {object} contains info about liquidityRates of assets on Aave protocol
 */
export const request = async () => {
  return client
    .query({
      query: gql(tokensQuery),
    })
    .then((data) => {
      let result = data.data.reserves;

      let resultObj = {};
      for (let i = 0; i < result.length; ++i)
        resultObj[result[i].underlyingAsset] =
          ((100 * result[i].liquidityRate) / Math.pow(10, 27)).toFixed(2) + "%";

      return resultObj;
    })
    .catch((err) => {
      console.log("Error fetching data: ", err);
    });
};
