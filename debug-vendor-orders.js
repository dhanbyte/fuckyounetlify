const { MongoClient } = require('mongodb');

async function debugVendorOrders() {
  const client = new MongoClient('mongodb+srv://dhananjaywin15112004:ec2cY3Gk2HxizdS2@cluster.4jkps.mongodb.net/?retryWrites=true&w=majority&appName=photos-test');
  
  try {
    await client.connect();
    const db = client.db('photos-test');
    
    console.log('=== VENDOR DEBUG ===');
    
    // Check vendors
    const vendors = await db.collection('vendors').find({}).limit(3).toArray();
    console.log('Sample vendors:');
    vendors.forEach(v => {
      console.log(`- ID: ${v._id}, Email: ${v.email}, Business: ${v.businessName}`);
    });
    
    console.log('\n=== PRODUCTS DEBUG ===');
    
    // Check vendor products
    const products = await db.collection('vendorproducts').find({}).limit(5).toArray();
    console.log('Sample vendor products:');
    products.forEach(p => {
      console.log(`- Product: ${p.name}, VendorId: ${p.vendorId}`);
    });
    
    console.log('\n=== ORDERS DEBUG ===');
    
    // Check vendor orders
    const orders = await db.collection('vendororders').find({}).limit(5).toArray();
    console.log('Sample vendor orders:');
    orders.forEach(o => {
      console.log(`- Order: ${o.orderId}, VendorId: ${o.vendorId}, Status: ${o.status}, Total: ${o.vendorTotal}`);
    });
    
    console.log('\n=== VENDORID MISMATCH CHECK ===');
    
    // Check for vendorId mismatches
    const uniqueProductVendorIds = await db.collection('vendorproducts').distinct('vendorId');
    const uniqueOrderVendorIds = await db.collection('vendororders').distinct('vendorId');
    
    console.log('VendorIds in products:', uniqueProductVendorIds);
    console.log('VendorIds in orders:', uniqueOrderVendorIds);
    
    // Find common vendorIds
    const commonIds = uniqueProductVendorIds.filter(id => uniqueOrderVendorIds.includes(id));
    console.log('Common vendorIds:', commonIds);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugVendorOrders();