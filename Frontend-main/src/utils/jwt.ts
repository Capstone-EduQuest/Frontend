export const decodeJwtUuid = (token: string): string | null => {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    const data = JSON.parse(decodedPayload);
    return data.uuid || null;
  } catch {
    return null;
  }
};
