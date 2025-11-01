import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

export async function GET() {
  try {
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    return NextResponse.json({
      success: true,
      ...authenticationParameters
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'ImageKit authentication failed'
    }, { status: 500 });
  }
}
