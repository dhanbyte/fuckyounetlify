import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserData from '@/models/UserData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Test database connection
    const dbConnection = await dbConnect();
    if (!dbConnection) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        dbConnected: false,
        mongoUri: !!process.env.MONGODB_URI
      });
    }

    // Test UserData model
    const wishlistData = await UserData.findOne({ userId, type: 'wishlist' });
    const cartData = await UserData.findOne({ userId, type: 'cart' });

    return NextResponse.json({
      success: true,
      dbConnected: true,
      mongoUri: !!process.env.MONGODB_URI,
      userId,
      wishlist: wishlistData?.data || [],
      cart: cartData?.data || [],
      wishlistExists: !!wishlistData,
      cartExists: !!cartData
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: error.message,
      dbConnected: false 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, data } = body;

    if (!userId || !type) {
      return NextResponse.json({ error: 'userId and type required' }, { status: 400 });
    }

    const dbConnection = await dbConnect();
    if (!dbConnection) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        dbConnected: false 
      });
    }

    const result = await UserData.updateOne(
      { userId, type },
      { userId, type, data, updated_at: new Date() },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      saved: result.modifiedCount > 0 || result.upsertedCount > 0,
      result
    });

  } catch (error) {
    console.error('Test save error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}