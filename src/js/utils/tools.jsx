// CheckHostname ... This removes an environment variable
// NOTE: This allows for the removal of the only environment variable
// const HOSTNAME = window && window.location && window.location.hostname;
// ------------------------------------------------------------------//
export function CheckHostname(hostname) {
  if (hostname === '127.0.0.1' || hostname === 'localhost') {
    return 'http://localhost:8081/';
  } if (hostname === 'go-react-template.com') {
    return 'https://go-react-template.com/';
  } if (hostname === 'go-react-template.com') {
    return 'https://go-react-template.com/';
  } if (hostname === 'go-react-template.com') {
    return 'https://go-react-template.com/';
  }
  // DEFAULT
  return 'http://localhost:8081/';
}

export function HandleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export function Notify(str) {
  // eslint-disable-next-line no-alert
  alert(str);
}

export function GetKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

export async function CustomFetchWithBasicAuth(endpoint) {
  const BASEURL = CheckHostname(window.location.hostname);
  const url = BASEURL.concat(endpoint);
  const auth = '{NEED_THIS}';
  const headers = new Headers();
  headers.append('Authorization', `Basic ${auth}`);
  try {
    const response = await fetch(url, { headers });
    const json = await response.json();
    return json;
  } catch (error) {
    let str = error.toString();
    if (error.toString() === 'TypeError: Failed to fetch') {
      str = 'Failed to fetch: Connection Unavailable';
    } else if (error.toString() === 'TypeError: Failed to execute \'fetch\' on \'Window\'') {
      str = 'Fetch failed!';
    }
    console.log('Other Error: ', str);
  }
}
