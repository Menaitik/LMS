const axios = require('axios');

async function test() {
  try {
    const cats = await axios.get('http://localhost:4000/api/v1/course/showAllCategories');
    const firstCatId = cats.data.data[0]._id;
    console.log('Testing categoryPageDetails with category ID:', firstCatId);
    
    try {
      const resp = await axios.post('http://localhost:4000/api/v1/course/categoryPageDetails', {
        categoryId: firstCatId
      });
      console.log('Success, response:', JSON.stringify(resp.data).substring(0, 100));
    } catch(err) {
      console.log('Failed with status:', err.response?.status);
      console.log('Error message from server:', err.response?.data);
    }
  } catch(err) {
    console.log('Failed to fetch categories:', err);
  }
}

test();
