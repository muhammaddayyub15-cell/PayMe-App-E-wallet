import axiosInstance from './axiosInstance';

export const fetchLanguageBundle = async (locale) => {
  const response = await axiosInstance.get(`/languages/${locale}`);
  return response.data.data;
};