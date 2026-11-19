import api from '../../../api/axios';

export const getHomeLayout = async (lang: string = 'en') => {
  const response = await api.get('/cms/home', { headers: { 'Accept-Language': lang } });
  return response.data.data;
};

export const updateHomeLayout = async (layoutData: any) => {
  const response = await api.put('/cms/home', layoutData);
  return response.data;
};

export const getFooterData = async (lang: string = 'en') => {
  const response = await api.get('/cms/footer', { headers: { 'Accept-Language': lang } });
  return response.data.data;
};

export const updateFooterData = async (footerData: any) => {
  const response = await api.put('/cms/footer', footerData);
  return response.data;
};