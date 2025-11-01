const { MongoClient } = require('mongodb');

async function debugUserOrders() {
  const client = new MongoClient('mongodb+srv://dhananjaywin15112004:ec2cY3Gk2HxizdS2@cluster.4jkps.mongodb.net/?retryWrites=true&w=majority&appName=photos-test');
  
  try {
    await client.connect();
    const db = client.db('photos-test');
    
    console.log('=== USER ORDERS DEBUG ===');
    
    // Check admin orders
    const orders = await db.collection('adminorders').find({}).limit(5).toArray();
    console.log('Sample user orders:');
    orders.forEach(o => {
      console.log(`- Order: ${o.orderId}, UserId: ${o.userId}, Total: ${o.total}, Status: ${o.status}`);
    });
    
    console.log('\n=== UNIQUE USER IDS ===');
    const uniqueUserIds = await db.collection('adminorders').distinct('userId');
    console.log('UserIds in orders:', uniqueUserIds);
    
    console.log('\n=== ADMIN USERS ===');
    const users = await db.collection('adminusers').find({}).limit(3).toArray();
    console.log('Sample users:');
    users.forEach(u => {
      console.log(`- User: ${u.fullName}, UserId: ${u.userId}, Email: ${u.email}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugUserOrders();