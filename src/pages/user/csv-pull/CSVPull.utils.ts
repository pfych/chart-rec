export const coolDownTimeInSeconds = 300;

export const getLastSuccess = () => {
  const storage = JSON.parse(localStorage.getItem('lastSuccess'));

  return {
    date: storage?.date || 0,
  };
};

export const pullFromLocalStorage = () => {
  const storage = JSON.parse(localStorage.getItem('konami'));

  return {
    username: storage?.username || '',
    password: storage?.password || '',
  };
};

export const getNiceErrorMessage = (error: string): string => {
  if (error.includes('ERR_PROXY_CONNECTION_FAILED')) {
    return 'Error: The proxy service is unavailable. Please contact me.';
  }

  if (error.includes('input[name=userId]')) {
    return 'Error: Konami sign-in layout potentially changed. Bailing early!';
  }

  return error;
};
