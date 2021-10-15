const url = "https://livepeer.com/api/stream?streamsonly=1";
var livePeerData;

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "Bearer 67150ea1-bfec-44ed-b301-0140d1074f8a",
  },
};

async function getLivePeerData() {
  livePeerData = await fetch(url, options)
    .then((res) => res.json())
    .then((data) => {
      console.log("this is live peer data:", data);
      // console.log(data);
    });
}

export { getLivePeerData };
