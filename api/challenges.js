const axios = require("axios");
let cache;
let lastCache = Date.now();
module.exports = async (req, res) => {
  const now = Date.now();
  const oneDay = 3600000 * 24;
  const cacheIsFresh = now - lastCache < oneDay;
  console.log(!!cache);
  console.log(cacheIsFresh);
  if (cache && cacheIsFresh) {
    res.json(cache);
  } else {
    let challenges = [];
    let page = 1;
    let stillFetching = true;
    while (stillFetching) {
      let response;
      try {
        response = await axios.get(
          `https://patientsafetymovement.org/wp-json/wp/v2/challenge?per_page=1&page=${page}&date=${Date.now()}`
        );
      } catch (e) {
        // console.log("caught exception: ", e);
      }
      if (response && response.data) {
        challenges.push(response.data[0]);
        page += 1;
      } else {
        stillFetching = false;
      }
    }

    cache = challenges;
    lastCache = Date.now();
    res.json(challenges);
  }
};
