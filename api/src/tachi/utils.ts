import axios from 'axios';

export const whoAmI = async (apiKey) => {
  try {
    return (
      await axios({
        url: 'https://kamaitachi.xyz/api/v1/users/me',
        method: 'GET',
        headers: { Authorization: apiKey },
      })
    ).data.body;
  } catch (e) {
    throw new Error(e);
  }
};
