import axios from 'axios';
 
export const registerToWordPress = async (formData) => {
  try {
    const res = await axios.post(
      'https://echoesfromthepast.be/custom/v1/register',
      {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }
    );
 
    console.log('✅ WordPress Registration Success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ WordPress Registration Failed:', error.response?.data || error.message);
    throw error;
  }
};