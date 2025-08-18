import axios from 'axios';
 
export const registerToWordPress = async (formData) => {
  try {
    const res = await axios.post(
      // 'https://echoesfromthepast.be/wp-json/custom/v1/register',
         'https://xavatestserver.com/ben/wp-json/custom/v1/register',
      {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      sex: formData.sex,
      age: formData.age,
      education: formData.education,
      province: formData.province,
      country: formData.country,
      role: formData.role,
      }
    );
 
    console.log('✅ WordPress Registration Success:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ WordPress Registration Failed:', error.response?.data || error.message);
    throw error;
  }
};