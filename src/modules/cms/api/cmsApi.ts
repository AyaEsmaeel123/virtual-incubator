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

// دالة رفع الصور (لازم مطور الباك إند يجهزها)
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  // غير الرابط حسب الـ Endpoint اللي عامله مطور الباك إند
  const response = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  // بترجع رابط الصورة بعد الرفع
  return response.data.url || response.data.data?.url; 
};